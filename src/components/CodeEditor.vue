<template>
	<!-- This div will hold the code editor -->
	<div ref="codeHolder" class="codeHolder"></div>
</template>


<script lang="ts">
//The code editor
import CodeMirror from "codemirror";
//Directly import the CSS for the language syntax
import 'codemirror/lib/codemirror.css';

export default {
	name: 'CodeEditor',
	props: {
		value: String
	},
	mounted() {
		//Create the code editor in the div, using the provided options
		let codeHolder = this.$refs.codeHolder;
		//let codeHolder = this.$refs.textarea;
		this.editor = CodeMirror(codeHolder, {
		//this._editor = CodeMirror.fromTextArea(codeHolder, {
			lineNumbers: true,
			tabSize: 4,
			value: this.code,
		});
		//Pass the change event (when the content changes at all) up to the next level
		this.editor.on("change", () => {
			this.$emit("change", this.editor.getValue());
		});
	},
	data() {
		return {
			//The actual code editor object.
			editor: undefined,
			//The string currently shown in the editor
			code: this.$props.value || "",
		}
	},
	methods: {
		/**
		 * Update the editor content when the <code>value</code> parameter updates
		 */
		onValueChange() {
			if (!this.editor) return;
			let cursor = this.editor.getCursor();
			this.code = this.$props.value;
			this.editor.setValue(this.code);
			this.editor.setCursor(cursor);
		}
	}
}
</script>

<style>
.codeHolder {
	text-align: left;
	height: 100%;
}
</style>