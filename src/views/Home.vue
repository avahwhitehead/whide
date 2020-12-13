<template>
	<div class="home">
		<div class="header">
			<div class="filler">
				Header content
			</div>
		</div>

		<div class="left">
			<div class="file-select">
				<div class="filler">
					Select file
				</div>
			</div>
		</div>

		<div class="code-editor">
			<CodeEditor />
		</div>

		<div class="right">
			<div class="filler">
				Other content
			</div>
		</div>

		<div class="footer">
			<div class="filler">
				Footer content
			</div>
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
// @ is an alias to /src
import CodeEditor from "@/components/CodeEditor";

export default {
	name: 'Home',
	components: {
		CodeEditor,
	}
}
</script>
