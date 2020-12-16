<template>
	<div class="editorHolder">
		<TabbedPanel :names="files.names" @change="onTabChange" @close="onTabClose">
			<CodeEditor v-bind:value="code" @change="onCodeChange" v-if="files.contents"/>
		</TabbedPanel>
	</div>
</template>


<script>
import CodeEditor from "@/components/CodeEditor";
import TabbedPanel from "@/components/TabbedPanel";

export default {
	name: 'CodeEditorContainer',
	components: {
		CodeEditor,
		TabbedPanel,
	},
	data() {
		return {
			files: {
				names: ["File 1", "File 2", "File 3"],
				contents: ["File 1 Body", "File 2 Body", "File 3 Body"],
			},
			selectedFile: 0,
			code: ""
		}
	},
	mounted() {
		//Select the first element by default
		this.onTabChange(this.files.contents.length ? 0: null);
	},
	methods: {
		/**
		 * Handle the active tab changing
		 * @param index		The new index of the active tab
		 */
		onTabChange(index) {
			this.selectedFile = index;
			this.code = this.files.contents[this.selectedFile] || "";
		},
		/**
		 * Handle a tab closing
		 * @param index		The index of the tab to close
		 */
		onTabClose(index) {
			this.files.names.splice(index, 1);
			this.files.contents.splice(index, 1);
		},
		/**
		 * Handle the code in the editor changing
		 * @param code		The new code
		 */
		onCodeChange(code) {
			//Maintain the local copy of the code
			this.code = code;
			//Update the code in the open file, if available
			if (this.files.contents) {
				this.files.contents[this.selectedFile] = code;
			}
		},
	}
}
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
</style>