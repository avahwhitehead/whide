<template>
	<div id="app" class="editor">
		<div class="header filler">
			<div class="menubar-holder">
				<MenuBar :menus="menus" @run="runPluginFunc"/>
			</div>
			<div class="right">
				<button @click="save" :disabled="!focused_file">Save File</button>
				<button @click="download" :disabled="!focused_file">Download File</button>
			</div>
		</div>

		<div class="body">
			<Container class="left filler">
				<FilePicker v-bind:files="files" @change="(file) => openFile(file)"/>
			</Container>

			<Container class="middle code-editor">
				<CodeEditorElement
					:openFiles="openFiles"
					:focused="focused_file"
					@editorChange="onEditorObjectChange"
					@file-focus="onOpenFileChange"
				/>
			</Container>

			<Container class="right filler">
				<PluginToggler :plugin-manager="this.pluginManager" />
			</Container>
		</div>

		<div class="footer">
			<run-panel/>
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
import fileDownloader from "js-file-download";
//Components
import CodeEditorElement, { ExtendedCodeEditorWrapper } from "@/components/CodeEditorElement.vue";
import Container from "@/components/Container.vue";
import FilePicker from "@/components/FilePicker.vue";
import MenuBar from "@/components/MenuBar.vue";
import PluginToggler from "@/components/PluginToggler.vue";
import RunPanel, { runPanelController } from "@/components/RunPanel.vue";
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
import PluginFunctionParameters from "@/api/types/PluginFunctionParameters";
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
	focused_file? : FileData;
	openFiles : CustomDict<FileData>;
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
		MenuBar,
		PluginToggler,
		RunPanel,
	},
	data() : DataTypesDescriptor {
		return {
			files: [],
			focused_file: undefined,
			openFiles: {},
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
			if (!this.openFiles[file.name]) {
				//Load the file contents
				browserFileStore.readFile(file).then((f) => {
					//Open the file
					//See: https://vuejs.org/2016/02/06/common-gotchas/#Why-isn%E2%80%99t-the-DOM-updating
					Vue.set(this.openFiles, f.name, f);
				});
			} else {
				this.focused_file = file;
			}
		},
		onOpenFileChange(fileData : FileData|undefined) : void {
			//Keep track of the currently focused file
			this.focused_file = fileData || undefined;
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
			const funcParameters : PluginFunctionParameters = {
				args: args,
				editorController: editorController,
				ioController: this.ioController,
				runPanelController: runPanelController,
			};
			_runFuncAsync(pluginFunction.run, funcParameters).catch((e) => {
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

.menubar-holder {
	display: inline-block;
	float: left;
}
.header .right {
	float: right;
}


.body {
	flex-grow: 1;
	display: flex;
	min-height: 0;
	height: 100%;
}
.body .left {
	width: 10%;
}
.body .right {
	width: 15%;
}
.body .middle {
	flex: 1;
}

.footer {
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

.header.filler, .footer .filler {
	background: #CCC;
	height: fit-content;
}

.header.filler {
	padding: 4px;
}

.footer .filler {
	background: #CCC;
}
</style>