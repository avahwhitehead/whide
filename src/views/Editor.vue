<template>
	<div class="editor">
		<div class="header">
			<div class="filler">
				Header content
				<br/>
				<button @click="save" :disabled="!focused_file">Save File</button>
			</div>
		</div>

		<div class="left">
			<Container class="filler">
				<FilePicker v-bind:files="files" @change="(file) => openFile(file)"  />
			</Container>
		</div>

		<div class="code-editor">
			<CodeEditorContainer v-bind:openFiles="openFiles" @file-focus="onOpenFileChange" />
		</div>

		<div class="right">
			<Container class="filler">
				Other content
			</Container>
		</div>

		<div class="footer">
			<Container :collapsible="false" class="filler">Footer content</Container>
		</div>

		<div>
			<input v-model="filename" placeholder="File Name"/>
			<button @click="create">Create</button>
			<br/>
			<button @click="del">Delete</button>
		</div>
	</div>
</template>


<script>
import CodeEditorContainer from "@/components/CodeEditorContainer.vue";
import Container from "@/components/Container";
import FilePicker from "@/components/FilePicker";
import { BrowserFileStore } from "@/fileStore/BrowserFileStore.ts";

const browserFileStore = new BrowserFileStore();

export default {
	name: 'Editor',
	components: {
		FilePicker,
		Container,
		CodeEditorContainer,
	},
	data() {
		return {
			files: [],
			filename: "",
			focused_file: null,
			openFiles: [],
		}
	},
	mounted() {
		//Load the directory structure
		browserFileStore.getDirectoryTree().then(value => {
			this.files = value;
		})
	},
	methods: {
		openFile(file) {
			//Don't open the same file twice
			if (!this.openFiles.includes(file)) {
				//Load the file contents
				browserFileStore.readFile(file).then((f) => {
					//Open the file
					this.openFiles.push(f);
				});
			}
		},
		onOpenFileChange(fileIndex) {
			//Keep track of the currently focussed file
			if (fileIndex < 0 || fileIndex >= this.openFiles.length) this.focused_file = null;
			else this.focused_file = this.openFiles[fileIndex];
		},
		async create() {
			//Create a new file with the given file name
			await browserFileStore.createFile(this.filename, undefined);
		},
		save() {
			if (this.focused_file) {
				browserFileStore.writeFile(this.focused_file)
					.then(() => console.log("Saved"))
					.catch((e) => console.error(e));
			} else {
				console.log(`No file open to save`);
			}
		},
		del() {

		},
	},
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