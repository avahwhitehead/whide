<template>
	<div class="editor">
		<div class="header">
			<div class="headerBar">
				<MenuElement v-for="(menu, i) in menus" :key="i" :menu="menu"></MenuElement>
			</div>
			<div class="filler">
				<button @click="save" :disabled="!focused_file">Save File</button>
				<button @click="download" :disabled="!focused_file">Download File</button>
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
import MenuElement from "@/components/menubar/MenuElement";
import { BrowserFileStore } from "@/fileStore/BrowserFileStore.ts";
import fileDownloader from "js-file-download";
import { run_load } from "@/api/fileLoader";

const browserFileStore = new BrowserFileStore();

export default {
	name: 'Editor',
	components: {
		FilePicker,
		Container,
		CodeEditorContainer,
		MenuElement
	},
	data() {
		return {
			files: [],
			filename: "",
			focused_file: null,
			openFiles: [],
			menuManager: null,
		}
	},
	computed: {
		menus() {
			if (!this.menuManager) return [];
			return this.menuManager.menus;
		}
	},
	created() {
		//Load the plugins
		//TODO: Also allow external plugins
		run_load(true, false).then(managers => {
			this.menuManager = managers.menuManager;
		});
	},
	mounted() {
		//Load the directory structure
		browserFileStore.getDirectoryTree().then(value => {
			this.files = value;
		});
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
			let file = this._find_by_name(this.files, this.filename);
			if (file) {
				browserFileStore.deleteFile(file).then(() => console.log("Deleted"));
			} else {
				console.log(`Could not find a file with the name '${this.filename}'`);
			}
		},
		download() {
			if (this.focused_file) {
				fileDownloader(this.focused_file.content, this.focused_file.name);
			} else {
				console.log(`No file open to download`);
			}
		},
		/**
		 * Recursively find a file using its name
		 * @param files		Array of files
		 * @param fileName	The file name
		 * @return {null|FileData}	The found file or null
		 */
		_find_by_name(files, fileName) {
			for (let file of files) {
				if (file.name === fileName) return file;
				let r = this._find_by_name(file.children, fileName);
				if (r) return r;
			}
			return null;
		}
	},
}
</script>


<style>
.headerBar {
	display: block;
}

.header {
	text-align: left;
}

.header, .footer {
	width: 100%;
	padding: 2px;
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