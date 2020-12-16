<template>
	<div class="editor">
		<div class="header">
			<div class="filler">
				Header content
			</div>
		</div>

		<div class="left">
			<Container class="filler">
				<FilePicker />
			</Container>
		</div>

		<div class="code-editor">
			<CodeEditorContainer />
		</div>

		<div class="right">
			<Container class="filler">
				Other content
			</Container>
		</div>

		<div class="footer">
			<Container :collapsible="false" class="filler">Footer content</Container>
		</div>
	</div>
</template>


<script>
import CodeEditorContainer from "@/components/CodeEditorContainer.vue";
import Container from "@/components/Container";
import FilePicker from "@/components/FilePicker";

export default {
	name: 'Editor',
	components: {
		FilePicker,
		Container,
		CodeEditorContainer,
	}
}
</script>


<style>
.header, .footer {
	width: 100%;
}

.left, .right {
	width: 15%
}

.left {
	float: left;
}

.right {
	float: right;
}


.code-editor {
	outline: 1px solid #AAA;
	height: 20em;
	width: 70%;
	display: inline-block;
}

/*
Fillers
*/

.filler {
	background: #999;
	height: 20em;
}

.header .filler, .footer .filler {
	background: #CCC;
	height: 3em;
}
</style>