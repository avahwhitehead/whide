<template>
	<div class="editorHolder">
		<TabbedPanel :names="files.map(f => f.name)" @change="onTabChange" @close="onTabClose">
			<!-- This div will hold the code editor -->
			<div ref="codeHolder" class="codeHolder"></div>
		</TabbedPanel>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import TabbedPanel from "@/components/TabbedPanel.vue";
import { FileData } from "@/fileStore/AbstractFileData";
//The code editor
import CodeMirror from "codemirror";
//Directly import the CSS for the language syntax
import 'codemirror/lib/codemirror.css';

type DataType = {
	selectedFile: number,
	editor: CodeMirror.Editor|undefined,
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
		this.editor = CodeMirror(this.$refs.codeHolder as HTMLElement, {
			lineNumbers: true,
			tabSize: 4,
			value: "",
		});

		//Pass the change event (when the content changes at all) up to the next level
		this.editor.on("change", () => {
			let code = this.editor!.getValue();
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
			this.editor!.setValue(code);
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