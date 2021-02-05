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


<script lang="ts">
import Vue from "vue";
import CodeMirror from "codemirror";
import electron from "electron";
import fileDownloader from "js-file-download";
//Components
import CodeEditorContainer from "@/components/CodeEditorContainer.vue";
import Container from "@/components/Container.vue";
import FilePicker from "@/components/FilePicker.vue";
import MenuElement from "@/components/menubar/MenuElement.vue";
import PluginToggler from "@/components/PluginToggler.vue";
import InputPrompt from "@/components/InputPrompt.vue";
//Other imports
import EditorController from "@/api/controllers/EditorController";
import IOController from "@/api/types/IOController";
import SystemPluginLoader from "@/api/systemPluginLoader";
import UserPluginLoader from "@/api/userPluginLoader";
import wrapEditor from "@/types/codeEditor";
import { AbstractFileData, FileData } from "@/fileStore/AbstractFileData";
import { BrowserFileStore } from "@/fileStore/BrowserFileStore.ts";
import { CustomDict } from "@/types/CustomDict";
import { Menu } from "@/api/parsers/MenuParser";
import { PluginFunction } from "@/api/types/PluginFunction";
import { PluginInfo } from "@/api/types/PluginInfo";
import { PluginManager } from "@/api/managers/PluginManager";

//Get the command line argument values
const commandLineArgs = electron.remote.getGlobal("commandLineArgs");

//File store object for in-browser storage
const browserFileStore = new BrowserFileStore();

//Plugin loaders for 1st and 3rd party plugins
const pluginManager = new PluginManager();
const systemPluginLoader = new SystemPluginLoader(pluginManager);
const clientPluginLoader = new UserPluginLoader(pluginManager);

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	files : AbstractFileData[];
	focused_file : FileData|null;
	openFiles : FileData[];
	codeEditor? : CodeMirror.Editor;
	pluginManager : PluginManager;
	ioController? : IOController;
	input : {
		showInput : boolean;
		title : string;
		message : string;
		error : string;
		expectingInput : boolean;
		callback : (v: string) => void;
		cancelCallback : () => void;
	}
}

//Run a function asynchronously
async function _runFuncAsync(func : Function, ...args : any[]) {
	await func(...args);
}

export default Vue.extend({
	name: 'Editor',
	components: {
		InputPrompt,
		FilePicker,
		Container,
		CodeEditorContainer,
		MenuElement,
		PluginToggler,
	},
	data() : DataTypesDescriptor {
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
		menus() : Menu[] {
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
			showOutput: (message: string, title: string = "") : Promise<void> => {
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
			getInput: (message: string, validator?: ((x:string) => boolean), title: string = "") : Promise<string|undefined> => {
				return new Promise(resolve => {
					//Make visible
					this.input.showInput = true;
					//Show the text box
					this.input.expectingInput = true;
					//Show the message
					this.input.title = title;
					this.input.message = message;
					//When the user enters the value
					this.input.callback = (val : string) => {
						//Check with the validator, or return true
						if (!validator || validator(val)) {
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
		browserFileStore.getDirectoryTree().then((value : AbstractFileData[]) => {
			this.files = value;
		});
	},
	methods: {
		openFile(file : FileData) : void {
			//Don't edit folders
			if (file.type !== "file") return;

			//Don't open the same file twice
			if (!this.openFiles.includes(file)) {
				//Load the file contents
				browserFileStore.readFile(file).then((f) => {
					//Open the file
					this.openFiles.push(f);
				});
			}
		},
		onOpenFileChange(fileIndex : number) : void {
			//Keep track of the currently focussed file
			if (fileIndex < 0 || fileIndex >= this.openFiles.length) this.focused_file = null;
			else this.focused_file = this.openFiles[fileIndex];
		},
		onEditorObjectChange(editor : CodeMirror.Editor) : void {
			this.codeEditor = editor;
		},
		save() : void {
			if (this.focused_file) {
				browserFileStore.writeFile(this.focused_file)
					.then(() => console.log("Saved"))
					.catch((e) => console.error(e));
			} else {
				console.log(`No file open to save`);
			}
		},
		download() : void {
			if (this.focused_file) {
				fileDownloader(this.focused_file.content, this.focused_file.name);
			} else {
				console.log(`No file open to download`);
			}
		},

		async hideInput() : Promise<void> {
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
		onInputSubmit(val : string) : void {
			//Call the input's callback
			if (this.input.callback) {
				this.input.callback(val);
			}
		},
		onInputCancel() : void {
			//Call the input's cancel callback
			if (this.input.cancelCallback) {
				this.input.cancelCallback();
			}
		},

		async runPluginFunc(data : { plugin: PluginInfo, command: string }) : Promise<void> {
			//Get the function linked to the menu item
			let pluginFunction: PluginFunction|undefined = await data.plugin.getFunc(data.command);
			if (!pluginFunction) throw new Error(`Couldn't find function ${(data.command)} in plugin ${data.plugin.name}`);

			//Make sure the IO controller exists
			if (!this.ioController) throw new Error("Couldn't get IO controller");

			let args: CustomDict<string> = {};
			for (let arg of (pluginFunction.args || [])) {
				//Default the validator to allowing anything
				let validator: (v: string) => (boolean | Promise<boolean>);
				validator = arg.validator || (() => true);
				//Prompt the user for the argument input
				let val = await this.ioController.getInput(
					arg.description || "",
					//Allow empty optional arguments, or validate the input
					async (s) => (arg.optional && !s || await validator(s)),
					`INPUT: ${arg.name}`
				);
				//End here if the user presses cancel
				if (val === undefined) return;
				//Otherwise store the value
				args[arg.name] = val;
			}

			//Make sure the code editor exists (this should never run)
			if (!this.codeEditor) throw new Error("Couldn't get code editor instance");

			//Build a wrapper around the editor
			let editorWrapper = wrapEditor(this.codeEditor);
			//Make the editor controller to pass to the plugin
			let editorController = new EditorController(editorWrapper, browserFileStore);

			//Run the function
			_runFuncAsync(pluginFunction.run, {
				args: args,
				editorController: editorController,
				ioController: this.ioController,
			}).catch((e) => {
				//Handle errors produced in the plugin function
				console.error(e);
				if (this.ioController) {
					this.ioController.showOutput(e.toString(), `Error in plugin function '${data.plugin.name}.${pluginFunction!.name}'`);
				}
			});
		},
	},
});
</script>

<style>
#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}

/*noinspection CssUnusedSymbol*/
#nav {
	padding: 30px;
}

#nav a {
	font-weight: bold;
	color: #2c3e50;
}

/*noinspection CssUnusedSymbol*/
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