<template>
	<div id="app" class="editor">
		<div class="header">
			<div class="headerBar">
				<div class="filler">
					<MenuElement :menu="menu" @run="runPluginFunc"
						v-for="(menu, i) in menus" :key="i"
					/>
					<div class="right">
						<button @click="save" :disabled="!focused_file">Save File</button>
						<button @click="download" :disabled="!focused_file">Download File</button>
					</div>
				</div>
			</div>
		</div>

		<div class="body">
			<Container class="left filler">
				<FilePicker v-bind:files="files" @change="(file) => openFile(file)"  />
			</Container>

			<div class="middle code-editor">
				<CodeEditorElement v-bind:openFiles="openFiles" @editorChange="onEditorObjectChange" @file-focus="onOpenFileChange" />
			</div>

			<Container class="right filler">
				<PluginToggler :plugin-manager="this.pluginManager" />
			</Container>
		</div>

		<Container class="footer" :left="['play', 'undo', 'bug', 'stop']">
			<div class="filler">
				<div>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</div>
				<div>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</div>
				<div>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur.</div>
				<div>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum</div>
			</div>
		</Container>

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
import fileDownloader from "js-file-download";
//Components
import CodeEditorElement, { ExtendedCodeEditorWrapper } from "@/components/CodeEditorElement.vue";
import Container from "@/components/Container.vue";
import FilePicker from "@/components/FilePicker.vue";
import MenuElement from "@/components/menubar/MenuElement.vue";
import PluginToggler from "@/components/PluginToggler.vue";
import InputPrompt from "@/components/InputPrompt.vue";
//Other imports
import EditorController from "@/api/controllers/EditorController";
import IOController, { InputPromptParams, OutputPromptParams } from "@/api/types/IOController";
import { CodeEditorWrapper } from "@/types/codeEditor";
import { AbstractFileData, FileData } from "@/fileStore/AbstractFileData";
import { BrowserFileStore } from "@/fileStore/BrowserFileStore.ts";
import { CustomDict } from "@/types/CustomDict";
import { Menu } from "@/api/parsers/MenuParser";
import { PluginFunction } from "@/api/types/PluginFunction";
import { PluginInfo } from "@/api/types/PluginInfo";
import { PluginManager } from "@/api/managers/PluginManager";
import { ProgramOptions } from "@/types/CommandLine";
import isElectron from "@/types/isElectron";

//Type of the imported plugin loaders
type AbstractPluginLoader = {
	run_load(m: PluginManager) : Promise<void>;
}

/**
 * Get a plugin loader for system plugins
 */
async function getSystemPluginLoader() : Promise<AbstractPluginLoader> {
	return await import("@/api/systemPluginLoader");
}
/**
 * Get a plugin loader for user plugins
 */
async function getUserPluginLoader() : Promise<AbstractPluginLoader> {
	return await import("@/api/userPluginLoader");
}

/**
 * Get the command line arguments passed to the app
 */
async function getCommandLineArgs() : Promise<ProgramOptions> {
	//Get the arguments from electron
	if (isElectron()) {
		//Import electron
		const electron = await import("electron");
		//Get the command line argument values
		return electron.remote.getGlobal("commandLineArgs");
	}
	//Default values
	return { };
}

//File store object for in-browser storage
const browserFileStore = new BrowserFileStore();

//Plugin loaders for 1st and 3rd party plugins
const pluginManager = new PluginManager();

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	files : AbstractFileData[];
	focused_file : FileData|null;
	openFiles : FileData[];
	codeEditor? : CodeEditorWrapper;
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
		CodeEditorElement,
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
		getSystemPluginLoader().then(async (systemPluginLoader) => {
			console.log("Loaded system plugins");
			await systemPluginLoader.run_load(pluginManager);

			//Load the user plugins if the app is in electron, and not in safe mode
			const commandLineArgs = await getCommandLineArgs();
			if (isElectron() && !commandLineArgs.safe) {
				getUserPluginLoader().then(async (clientPluginLoader) => {
					console.log("Loaded user plugins");
					await clientPluginLoader.run_load(pluginManager);
				});
			}
		});
	},
	mounted() {
		this.ioController = {
			showOutput: (props: OutputPromptParams) : Promise<void> => {
				return new Promise(resolve => {
					//Make visible
					this.input.showInput = true;
					//Don't the text box
					this.input.expectingInput = false;
					//Set the message to show
					this.input.title = props.title || "";
					this.input.message = props.message;
					//When the user submits
					this.input.callback = () => {
						//Hide the prompt
						this.hideInput();
						//Done
						resolve();
					};
				});
			},
			getInput: (props: InputPromptParams) : Promise<string|undefined> => {
				return new Promise(resolve => {
					//Make visible
					this.input.showInput = true;
					//Show the text box
					this.input.expectingInput = true;
					//Show the message
					this.input.title = props.title || "";
					this.input.message = props.message;
					//When the user enters the value
					this.input.callback = (val : string) => {
						//Check with the validator, or return true
						if (!props.validator || props.validator(val)) {
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
		onEditorObjectChange(editor : ExtendedCodeEditorWrapper) : void {
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
				let val = await this.ioController.getInput({
					title: `INPUT: ${arg.name}`,
					message: arg.description || "",
					//Allow empty optional arguments, or validate the input
					validator: async (s) => arg.optional && !s || await validator(s),
				});
				//End here if the user presses cancel
				if (val === undefined) return;
				//Otherwise store the value
				args[arg.name] = val;
			}

			//Make sure the code editor exists (this should never run)
			if (!this.codeEditor) throw new Error("Couldn't get code editor instance");

			//Make the editor controller to pass to the plugin
			let editorController: EditorController = new EditorController(this.codeEditor, browserFileStore);

			//Run the function
			_runFuncAsync(pluginFunction.run, {
				args: args,
				editorController: editorController,
				ioController: this.ioController,
			}).catch((e) => {
				//Handle errors produced in the plugin function
				console.error(e);
				if (this.ioController) {
					this.ioController.showOutput({
						message: e.toString(),
						title: `Error in plugin function '${data.plugin.name}.${pluginFunction!.name}'`,
					});
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
#app {
	display: flex;
	flex-direction: column;

	height: 100%;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

.headerBar {
	display: block;
}
.header {
	text-align: left;
}
.header .right {
	display: inline;
	float: right;
}


.body {
	flex-grow: 1;
	display: flex;
	min-height: 0;
	height: 100%;
}
.body .left, .body .right {
	width: 10%;
}
.body .middle {
	flex: 1;
}

.footer {
	min-height: 10em;
	height: fit-content;
}

.code-editor {
	outline: 1px solid #AAA;
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
}

.header .filler, .footer .filler {
	background: #CCC;
	height: fit-content;
}

.header .filler {
	padding: 4px;
}

.footer .filler {
	background: #CCC;
}
</style>