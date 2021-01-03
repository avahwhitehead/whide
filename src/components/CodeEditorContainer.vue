<template>
	<div class="editorHolder">
		<TabbedPanel :names="files.map(f => f.name)" @change="onTabChange" @close="onTabClose">
			<CodeEditor v-bind:value="code" @change="onCodeChange" v-if="files.map(f => f.content)"/>
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
	props: {
		openFiles: Array
	},
	data() {
		return {
			selectedFile: 0,
			code: ""
		}
	},
	mounted() {
		//Select the first element by default
		this.onTabChange(this.files.length ? 0 : null);
	},
	computed: {
		files() {
			return this.$props.openFiles || [];
		}
	},
	methods: {
		/**
		 * Handle the active tab changing
		 * @param index		The new index of the active tab
		 */
		onTabChange(index) {
			index = Math.max(index, 0);
			index = Math.min(index, this.files.length);

			this.selectedFile = index;
			if (this.files.length > 0) {
				this.code = this.files[this.selectedFile].content;
				this.$emit("file-focus", this.selectedFile);
			} else {
				this.code = "";
				this.$emit("file-focus", null);
			}
		},
		/**
		 * Handle a tab closing
		 * @param index		The index of the tab to close
		 */
		onTabClose(index) {
			this.files.splice(index, 1);
		},
		/**
		 * Handle the code in the editor changing
		 * @param code		The new code
		 */
		onCodeChange(code) {
			//Maintain the local copy of the code
			this.code = code;
			//Update the code in the open file, if available
			if (this.files.length > 0) {
				this.files[this.selectedFile].content = code;
			} else {
				//TODO: Handle code change with no open files
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