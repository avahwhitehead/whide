<template>
	<div class="editor">
		<div class="header">
			<div class="headerBar">
				<MenuElement :menu="menu" @run="runPluginFunc"
					v-for="(menu, i) in menus" :key="i"
				/>
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
			<CodeEditorContainer v-bind:openFiles="openFiles" @editorChange="onEditorObjectChange" @file-focus="onOpenFileChange" />
		</div>

		<div class="right">
			<Container class="filler">
				<PluginToggler :plugin-manager="this.pluginManager" />
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

		<div class="inputElements" v-if="input.showInput">
			<inputPrompt
				:get-input="input.expectingInput"
				:message="input.message"
				:error="input.error"
				@submit="onInputSubmit"
			/>
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
import EditorController from "@/api/controllers/EditorController";
import PluginToggler from "@/components/PluginToggler.vue";
import InputPrompt from "@/components/InputPrompt";

const browserFileStore = new BrowserFileStore();

export default {
	name: 'Editor',
	components: {
		InputPrompt,
		FilePicker,
		Container,
		CodeEditorContainer,
		MenuElement,
		PluginToggler,
	},
	data() {
		return {
			files: [],
			filename: "",
			focused_file: null,
			openFiles: [],
			menuManager: null,
			codeEditor: undefined,
			pluginManager: undefined,
			ioController: undefined,
			input: {
				showInput: false,
				message: "",
				error: "",
				expectingInput: true,
				callback: () => {},
			}
		}
	},
	computed: {
		menus() {
			if (!this.menuManager) return [];
			return this.menuManager.menus;
		},
		_editorController() {
			return new EditorController(this.codeEditor, browserFileStore);
		}
	},
	created() {
		//Load the plugins
		//TODO: Also allow external plugins
		run_load(true, false).then(pluginManager => {
			this.pluginManager = pluginManager;
			this.menuManager = pluginManager.menuManager;
		});
	},
	mounted() {
		this.ioController = {
			showOutput: (message) => {
				return new Promise(resolve => {
					//Make visible
					this.input.showInput = true;
					//Don't the text box
					this.input.expectingInput = false;
					//Set the message to show
					this.input.message = message;
					//When the user submits
					this.input.callback = () => {
						//Hide the prompt
						this.hideInput();
						//Done
						resolve();
					};
				});
			},
			getInput: (message, validator) => {
				//Use the provided validator, or always return true
				validator = validator || (() => true);
				return new Promise(resolve => {
					//Make visible
					this.input.showInput = true;
					//Show the text box
					this.input.expectingInput = true;
					//Show the message
					this.input.message = message;
					//When the user enters the value
					this.input.callback = (val) => {
						//Check with the validator
						if (validator(val)) {
							this.input.error = "";
							//Hide the prompt
							this.hideInput();
							//Done
							resolve(val);
						} else {
							this.input.error = "Invalid input";
						}
					};
				});
			},
		};

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
		onEditorObjectChange(editor) {
			this.codeEditor = editor;
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

		async hideInput() {
			//Make the input invisible
			this.input.showInput = false;
			//Default to allowing input
			this.input.expectingInput = true;
			//Clear the message
			this.input.message = "";
			//Clear the callback
			this.input.callback = () => {};
		},
		onInputSubmit(val) {
			//Call the input's callback
			if (this.input.callback) {
				this.input.callback(val);
			}
		},

		async runPluginFunc(data) {
			//TODO: Remove these aliases when this file is converted to TypeScript
			let plugin = data.plugin;
			let command = data.command;

			//Get the function linked to the menu item
			let pluginFunction = await plugin.getFunc(command);

			//Run the function if possible
			if (pluginFunction) {
				//Make sure the code editor exists (this should never run)
				if (!this.codeEditor) throw new Error("Couldn't get code editor instance");
				//Run the function
				pluginFunction.run({
					args: {},
					editorController: this._editorController,
					ioController: this.ioController,
				});
			} else {
				//Error otherwise
				console.error(`Couldn't find function ${command} in plugin ${plugin.name}`);
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
				if (file.children) {
					let r = this._find_by_name(file.children, fileName);
					if (r) return r;
				}
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

.inputElements {
	border: 1px solid black;
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