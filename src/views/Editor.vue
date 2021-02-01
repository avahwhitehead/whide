<template>
	<div id="app" class="editor">
		<div class="header">
			<div class="headerBar">
				<div class="filler">
					<MenuElement :menu="menu" @run="runPluginFunc"
						v-for="(menu, i) in menus" :key="i"
					/>
					<div>
						<button @click="save" :disabled="!focused_file">Save File</button>
						<button @click="download" :disabled="!focused_file">Download File</button>
					</div>
				</div>
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

		<div class="inputModal" v-if="input.showInput">
			<div class="content">
				<inputPrompt
					:get-input="input.expectingInput"
					:title="input.title"
					:message="input.message"
					:error="input.error"
					@submit="onInputSubmit"
					@cancel="onInputCancel"
				/>
			</div>
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
import SystemPluginLoader from "@/api/systemPluginLoader";
import EditorController from "@/api/controllers/EditorController";
import PluginToggler from "@/components/PluginToggler.vue";
import InputPrompt from "@/components/InputPrompt";
import UserPluginLoader from "@/api/userPluginLoader";
import { PluginManager } from "@/api/managers/PluginManager";
import electron from "electron";

//Get the command line argument values
const commandLineArgs = electron.remote.getGlobal("commandLineArgs");

const browserFileStore = new BrowserFileStore();

//Plugin loaders for 1st and 3rd party plugins
const pluginManager = new PluginManager();
const systemPluginLoader = new SystemPluginLoader(pluginManager);
const clientPluginLoader = new UserPluginLoader(pluginManager);

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
			focused_file: null,
			openFiles: [],
			codeEditor: undefined,
			pluginManager: pluginManager,
			ioController: undefined,
			input: {
				showInput: false,
				title: "",
				message: "",
				error: "",
				expectingInput: true,
				callback: () => {},
				cancelCallback: () => {},
			}
		}
	},
	computed: {
		menus() {
			return pluginManager.menuManager.menus;
		},
	},
	created() {
		//Load the system plugins first
		systemPluginLoader.run_load().then(() => {
			console.log("Loaded system plugins");
			//Load the user plugins if the app is not in safe mode
			if (!commandLineArgs.safe) {
				clientPluginLoader.run_load().then(() => {
					console.log("Loaded user plugins");
				});
			}
		});
	},
	mounted() {
		this.ioController = {
			showOutput: (message, title = "") => {
				return new Promise(resolve => {
					//Make visible
					this.input.showInput = true;
					//Don't the text box
					this.input.expectingInput = false;
					//Set the message to show
					this.input.title = title;
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
			getInput: (message, validator = null, title = "") => {
				//Use the provided validator, or always return true
				validator = validator || (() => true);
				return new Promise(resolve => {
					//Make visible
					this.input.showInput = true;
					//Show the text box
					this.input.expectingInput = true;
					//Show the message
					this.input.title = title;
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
					//If the user cancels the operation
					this.input.cancelCallback = () => {
						this.hideInput();
						resolve(undefined);
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
		save() {
			if (this.focused_file) {
				browserFileStore.writeFile(this.focused_file)
					.then(() => console.log("Saved"))
					.catch((e) => console.error(e));
			} else {
				console.log(`No file open to save`);
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
			this.input.title = "";
			this.input.message = "";
			//Clear the callback
			this.input.callback = () => {};
			this.input.cancelCallback = () => {};
		},
		onInputSubmit(val) {
			//Call the input's callback
			if (this.input.callback) {
				this.input.callback(val);
			}
		},
		onInputCancel() {
			//Call the input's cancel callback
			if (this.input.cancelCallback) {
				this.input.cancelCallback();
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
				let args = {};
				for (let arg of (pluginFunction.args || [])) {
					//Prompt the user for the argument input
					let val = await this.ioController.getInput(
						arg.description,
						//Allow empty optional arguments, or validate the input
						async (s) => (arg.optional && !s || await arg.validator(s)),
						`INPUT: ${arg.name}`
					);
					//End here if the user presses cancel
					if (val === undefined) return;
					//Otherwise store the value
					args[arg.name] = val;
				}

				//Make sure the code editor exists (this should never run)
				if (!this.codeEditor) throw new Error("Couldn't get code editor instance");
				try {
					//Make an editor controller object
					//TODO: User plugins freeze the editor if a CodeMirror object is passed directly.
					//	I'm pretty sure it's because of this: https://www.electronjs.org/docs/api/remote#passing-callbacks-to-the-main-process
					//TODO: Write a proper wrapper around the editor to allow control from within in plugins.
					let editorWrapper = {
						getValue: () => {
							return this.codeEditor.getValue();
						},
						setValue: (value) => {
							this.codeEditor.setValue(value);
						},
					};
					//noinspection JSCheckFunctionSignatures
					let editorController = new EditorController(editorWrapper, browserFileStore);

					//Run the function
					pluginFunction.run({
						args: args,
						editorController: editorController,
						ioController: this.ioController,
					});
				} catch (e) {
					//Handle errors produced in the plugin function
					console.error(e);
					this.ioController.showOutput(e, `Error in plugin function '${plugin.name}.${pluginFunction}'`);
				}
			} else {
				//Error otherwise
				console.error(`Couldn't find function ${command} in plugin ${plugin.name}`);
				this.ioController.showOutput(`Couldn't find function ${command} in plugin ${plugin.name}`, "Error");
			}
		},
	},
}
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}

#nav {
	padding: 30px;
}

#nav a {
	font-weight: bold;
	color: #2c3e50;
}

#nav a.router-link-exact-active {
	color: #42b983;
}
</style>


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
Popup stylings based broadly on W3Schools':
https://www.w3schools.com/howto/howto_css_modals.asp
*/
.inputModal {
	position: fixed;
	z-index: 5;

	/*Fill the entire screen*/
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;

	/*Transparent background, with non-transparent fallback*/
	background-color: rgb(0,0,0);
	background-color: rgba(0,0,0,0.4);
}
.inputModal .content {
	background-color: #FFFFFF;
	padding: 20px;
	border: 1px solid #888;
	margin: 15% auto;
	width: 50%;
	overflow: auto;
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
}

.header .filler {
	padding: 4px;
	height: 100%;
}

.footer .filler {
	background: #CCC;
	height: 3em;
}
</style>