<template>
	<div class="editorHolder">
		<TabbedPanel :names="files.map(f => f.name)" @change="onTabChange" @close="onTabClose"></TabbedPanel>
		<!-- This div will hold the code editor -->
		<div ref="codeHolder" class="codeHolder"></div>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import TabbedPanel from "@/components/TabbedPanel.vue";
import { FileData } from "@/fileStore/AbstractFileData";
import EditorWidget from "./_internal/codeEditor/EditorWidget.vue";
import { CodeEditorWrapper, wrapEditor } from "@/types/codeEditor";
//The code editor
import CodeMirror from "codemirror";
//CodeMirror styling
import 'codemirror/lib/codemirror.css';
//While language syntax definition
import WHILE from "@/assets/whileSyntaxMode.ts";

interface DataType {
	selectedFile: number,
	editor: CodeEditorWrapper|undefined,
}

export type ExtendedCodeEditorWrapper = CodeEditorWrapper & {
	editorWrapper: CodeEditorWrapper,
	_breakpoints: CodeMirror.LineHandle[],
	/**
	 * Add a breakpoint to the editor
	 */
	addBreakpoint(line: any): Promise<CodeMirror.LineWidget>;
	/**
	 * Remove a breakpoint from the editor
	 */
	removeBreakpoint(widget: CodeMirror.LineWidget|CodeMirror.LineHandle): Promise<void>;
};

function wrapExtendedCodeEditor(_editor : CodeEditorWrapper) : ExtendedCodeEditorWrapper {
	const breakpoints : CodeMirror.LineHandle[] = [];
	return {
		editorWrapper: _editor,
		..._editor,
		_breakpoints: [],
		addBreakpoint: async (line: number|CodeMirror.LineHandle) : Promise<CodeMirror.LineWidget> => {
			//Make a new widget element
			const node: Vue = new EditorWidget({
				propsData: {
					type: 'breakpoint',
				}
			});
			node.$mount();

			//Save the line to the breakpoints list
			if (typeof(line) === "number") {
				let h: CodeMirror.LineHandle = await _editor.getLineHandle(line);
				if (h) breakpoints.push(h);
			} else {
				breakpoints.push(line);
			}

			//Show the widget on the editor
			return await _editor.addLineWidget(
				line,
				node.$el as HTMLElement,
				{
					above: true,
					coverGutter: true,
					noHScroll: true,
					handleMouseEvents: true,
				}
			);
		},
		removeBreakpoint: async (widget : CodeMirror.LineWidget) => {
			await _editor.removeLineWidget(widget);
		},
	};
}

export default Vue.extend({
	name: 'CodeEditorContainer',
	components: {
		TabbedPanel,
	},
	props: {
		openFiles: Array as () => FileData[]
	},
	data() : DataType {
		return {
			selectedFile: 0,
			//The code editor object.
			//Is undefined until the object is created in `mounted`
			editor: undefined,
		}
	},
	mounted() {
		//Create the code editor in the div
		let codeMirror : CodeMirror.Editor = CodeMirror(this.$refs.codeHolder as HTMLElement, {
			lineNumbers: true,
			tabSize: 4,
			value: "",
			mode: WHILE,
		});
		//Wrap the editor in an asynchronous wrapper
		this.editor = wrapExtendedCodeEditor(wrapEditor(codeMirror));

		//Pass the change event (when the content changes at all) up to the next level
		this.editor.on("change", async () => {
			if (!this.editor) throw new Error("Couldn't get editor");

			let code = await this.editor.getValue();
			let openFiles = this.openFiles as Array<FileData>;
			//Update the code in the open file, if available
			if (openFiles.length > 0) {
				openFiles[this.selectedFile].content = code;
			} else {
				//TODO: Handle code change with no open files
			}
		});

		//Select the first element by default
		this.onTabChange(this.files.length ? 0 : null);
	},
	computed: {
		files() : Array<FileData> {
			return this.$props.openFiles || [];
		}
	},
	methods: {
		updateCode(code : string) {
			if (!this.editor) throw new Error("Couldn't get editor");
			this.editor.setValue(code);
		},
		/**
		 * Handle the active tab changing
		 * @param index		The new index of the active tab
		 */
		onTabChange(index : number|null) : void {
			if (!index) {
				index = 0;
			} else {
				index = Math.max(index, 0);
				index = Math.min(index, this.openFiles.length);
			}

			this.selectedFile = index;
			if (this.openFiles.length > 0) {
				this.updateCode(this.openFiles[index].content);
				this.$emit("file-focus", index);
			} else {
				this.updateCode("");
				this.$emit("file-focus", null);
			}
		},
		/**
		 * Handle a tab closing
		 * @param index		The index of the tab to close
		 */
		onTabClose(index : number) : void {
			this.openFiles.splice(index, 1);
		},
	},
	watch: {
		editor(new_val) {
			this.$emit("editorChange", new_val);
		}
	}
});
</script>

<style scoped>
.header .tab {
	outline: 1px solid black;
	padding: 2px;
	margin: auto 5px;
}

.tab.active {
	border-color: red;
}

.codeHolder {
	text-align: left;
	height: 100%;
}
</style>