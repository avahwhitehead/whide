<template>
	<div class="editor">
		<div class="header">
			<div class="filler">
				Header content
			</div>
		</div>

		<div class="left">
			<div class="file-select">
				<Container class="filler">
					Select file
				</Container>
			</div>
		</div>

		<div class="code-editor">
			<CodeEditor />
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

<style>
.home {

}

.header, .footer {
	width: 100%;
}

.header {

}

.footer {

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
	width: 100%;
	height: 20em;
}

.header .filler, .footer .filler {
	background: #CCC;
	height: 3em;
}
</style>

<script>
import CodeEditor from "@/components/CodeEditor.vue";
import Container from "@/components/Container";

export default {
	name: 'Editor',
	components: {
		Container,
		CodeEditor,
	}
}
</script>
