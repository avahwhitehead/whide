<template>
	<div class="editorHolder">
		<TabbedPanel class="editor-tabs" :names="files.map(f => f.name)" @change="onTabChange" @close="onTabClose" />
		<!-- This div will hold the code editor -->
		<div ref="codeHolder" class="codeHolder"></div>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import TabbedPanel from "@/components/TabbedPanel.vue";
import { FileData } from "@/fileStore/AbstractFileData";
import EditorWidget from "./_internal/codeEditor/EditorWidget.vue";
import BreakpointWidget from "./_internal/codeEditor/BreakpointWidget.vue";
import { CodeEditorWrapper, wrapEditor } from "@/types/codeEditor";
//The code editor
import CodeMirror from "codemirror";
//CodeMirror styling
import 'codemirror/lib/codemirror.css';
//While language syntax definition
import WHILE from "@/assets/whileSyntaxMode.ts";

interface DataType {
	selectedFile: number,
	editor: ExtendedCodeEditorWrapper|undefined,
}

type LineWidgetType = { line: CodeMirror.LineHandle, widget: CodeMirror.LineWidget };

export type ExtendedCodeEditorWrapper = CodeEditorWrapper & {
	editorWrapper: CodeEditorWrapper,
	_breakpoints: CodeMirror.LineHandle[],
	_errors: LineWidgetType[],
	_infos: LineWidgetType[],
	_warnings: LineWidgetType[],
	/**
	 * Show an error message in the editor
	 * @param line		The line to show on
	 * @param message	The message to show
	 */
	addError(line: any, message: string): Promise<CodeMirror.LineWidget>;
	/**
	 * Show a warning message in the editor
	 * @param line		The line to show on
	 * @param message	The message to show
	 */
	addWarning(line: any, message: string): Promise<CodeMirror.LineWidget>;
	/**
	 * Show an information message in the editor
	 * @param line		The line to show on
	 * @param message	The message to show
	 */
	addInfo(line: any, message: string): Promise<CodeMirror.LineWidget>;
	/**
	 * Remove a breakpoint  widget from the editor
	 * @param widget	The widget to remove
	 */
	removeError(widget: CodeMirror.LineWidget | CodeMirror.LineHandle): Promise<void>;
	/**
	 * Remove an error message widget from the editor
	 * @param widget	The widget to remove
	 */
	removeWarning(widget: CodeMirror.LineWidget | CodeMirror.LineHandle): Promise<void>;
	/**
	 * Remove a warning message widget from the editor
	 * @param widget	The widget to remove
	 */
	removeInfo(widget: CodeMirror.LineWidget | CodeMirror.LineHandle): Promise<void>;
	/**
	 * Add or remove a breakpoint from the editor
	 * @param line		The line to use
	 * @param enabled	`true` to enable a breakpoint, `false` to disable, `undefined` to toggle
	 */
	toggleBreakpoint(line: number|CodeMirror.LineHandle, enabled?: boolean) : Promise<void>,
};

async function addWidget(editor: CodeEditorWrapper, line: number|CodeMirror.LineHandle, element: HTMLElement) : Promise<CodeMirror.LineWidget> {
	return editor.addLineWidget(line, element, {
		above: true,
		coverGutter: true,
		noHScroll: true,
		handleMouseEvents: true,
	});
}

async function asLineHandle(editor: CodeEditorWrapper, line: number|CodeMirror.LineHandle) : Promise<CodeMirror.LineHandle> {
	if (typeof(line) === "number") return await editor.getLineHandle(line);
	return line;
}

async function makeWidget(editor : CodeEditorWrapper, line: number|CodeMirror.LineHandle, type: string, arr: LineWidgetType[]) : Promise<CodeMirror.LineWidget> {
	//Make a new widget element
	const node: Vue = new EditorWidget({
		propsData: { type: type }
	});
	node.$mount();
	//Show the widget on the editor
	const lineWidget = await addWidget(editor, line, node.$el as HTMLElement);
	//Save the line to the list
	arr.push({
		line: await asLineHandle(editor, line),
		widget: lineWidget,
	});
	return lineWidget;
}

function wrapExtendedCodeEditor(_editor : CodeEditorWrapper) : ExtendedCodeEditorWrapper {
	const breakpoints : CodeMirror.LineHandle[] = [];
	const errors : LineWidgetType[] = [];
	const infos : LineWidgetType[] = [];
	const warnings : LineWidgetType[] = [];

	return {
		editorWrapper: _editor,
		..._editor,

		_breakpoints: breakpoints,
		_errors: errors,
		_infos: infos,
		_warnings: warnings,

		addError:
			async (line: number|CodeMirror.LineHandle): Promise<CodeMirror.LineWidget> => makeWidget(_editor, line, 'error', errors),
		addInfo:
			async (line: number|CodeMirror.LineHandle): Promise<CodeMirror.LineWidget> => makeWidget(_editor, line, 'info', infos),
		addWarning:
			async (line: number|CodeMirror.LineHandle): Promise<CodeMirror.LineWidget> => makeWidget(_editor, line, 'warning', warnings),
		removeError:
			async (widget: CodeMirror.LineWidget): Promise<void> => _editor.removeLineWidget(widget),
		removeInfo:
			async (widget: CodeMirror.LineWidget): Promise<void> => _editor.removeLineWidget(widget),
		removeWarning:
			async (widget: CodeMirror.LineWidget): Promise<void> => _editor.removeLineWidget(widget),
		toggleBreakpoint: async (line: number|CodeMirror.LineHandle, enabled?: boolean) : Promise<void> => {
			//Line info
			const lineHandle: CodeMirror.LineHandle = await asLineHandle(_editor, line);
			let info = await _editor.lineInfo(line);

			//Not a valid line
			if (!info) return;

			//Toggle the breakpoint if a state wasn't specified
			if (enabled === undefined) enabled = !info.gutterMarkers;

			let marker : HTMLElement|null = null;
			if (enabled) {
				//Make a new breakpoint marker
				const node: Vue = new BreakpointWidget();
				node.$mount();
				//Use the breakpoint widget as the gutter marker
				marker = node.$el as HTMLElement;
				//Push the line to the list
				breakpoints.push(lineHandle);
			} else {
				//Remove the line from the list of breakpoints
				const index = breakpoints.indexOf(lineHandle);
				if (index >= 0) breakpoints.splice(index, 1);
			}
			//Add/remove the marker to/from the gutter
			await _editor.setGutterMarker(line, "breakpoints", marker);
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
			gutters: ["CodeMirror-linenumbers", "breakpoints"],
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

		//Toggle breakpoints when the gutter is clicked
		this.editor.on("gutterClick",
			async (_, line) => this.editor!.toggleBreakpoint(line)
		);

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

<style>
/*Add gutter space for the breakpoint icons*/
.codeHolder .breakpoints {
	width: .8em;
}

.CodeMirror {
	height: 100%;
	flex: 1;
}
</style>

<style scoped>
.editorHolder {
	height: 100%;
	display: flex;
	flex-direction: column;
}

.codeHolder {
	text-align: left;
	height: 100%;
}

.editor-tabs {
	height: 2em;
}

.header .tab {
	outline: 1px solid black;
	padding: 2px;
	margin: auto 5px;
}

.tab.active {
	border-color: red;
}
</style>