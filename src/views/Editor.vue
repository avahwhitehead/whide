<template>
	<div class="editor">
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
				<FilePicker :directory="cwd" :load-level="2" @change="(file) => openFile(file)"/>
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

		<InputPrompt :cwd="cwd" @controller="c => this.ioController = c" />
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
import IOController from "@/api/types/IOController";
import { CodeEditorWrapper } from "@/types/codeEditor";
import { AbstractInternalFile, InternalFile } from "@/files/InternalFile";
import { CustomFsContainer, getFsContainer } from "@/files/fs";
import { CustomDict } from "@/types/CustomDict";
import { Menu } from "@/api/parsers/MenuParser";
import { PluginFunction } from "@/api/types/PluginFunction";
import PluginFunctionParameters from "@/api/types/PluginFunctionParameters";
import { PluginInfo } from "@/api/types/PluginInfo";
import { PluginManager } from "@/api/managers/PluginManager";
import { ProgramOptions } from "@/types/CommandLine";
import isElectron from "@/types/isElectron";
import { Stats } from "fs";

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

//Plugin loaders for 1st and 3rd party plugins
const pluginManager = new PluginManager();

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	focused_file? : InternalFile;
	openFiles : CustomDict<InternalFile>;
	codeEditor? : CodeEditorWrapper;
	pluginManager : PluginManager;
	ioController? : IOController;
	cwd: string;
}

//Run a function asynchronously
async function _runFuncAsync(func : Function, ...args : any[]) {
	await func(...args);
}

//Start from the current directory if in electron, or root if in the browser
const STARTING_DIRECTORY: string = isElectron() ? process.cwd() : '/';

async function _getStartingDir(opts : ProgramOptions) : Promise<string> {
	//No directory specified - use the default
	if (!opts.workingDir) return STARTING_DIRECTORY;

	const userDir : string = opts.workingDir;

	const {fs, path} = await getFsContainer();
	let stats: Stats;
	try {
		//Make sure the path exists
		stats = await new Promise<Stats>((resolve, reject) => {
			fs.stat(userDir, ((err, s) => {
				if (err) reject(err);
				else resolve(s);
			}));
		});
	} catch (e) {
		//See if the error is "file not found"
		if (e == 'ENOENT' || e.code === 'ENOENT') {
			console.error("Target directory doesn't exist; using default");
			return STARTING_DIRECTORY;
		} else {
			throw e;
		}
	}

	//If the path is a file, use the parent
	if (!stats.isDirectory()) {
		console.error("Target directory is a file; using parent");
		return path.resolve(userDir, '..');
	}
	//Otherwise Use the provided directory
	return userDir;
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
			focused_file: undefined,
			openFiles: {},
			codeEditor: undefined,
			pluginManager: pluginManager,
			ioController: undefined,
			cwd: STARTING_DIRECTORY,
		}
	},
	computed: {
		menus() : Menu[] {
			return pluginManager.menuManager.menus;
		},
	},
	created() {
		getCommandLineArgs().then(async commandLineArgs => {
			this.cwd = await _getStartingDir(commandLineArgs);

			//Load the system plugins first
			getSystemPluginLoader().then(async (systemPluginLoader) => {
				console.log("Loaded system plugins");
				await systemPluginLoader.run_load(pluginManager);
				//Load the user plugins if the app is in electron, and not in safe mode
				if (isElectron() && !commandLineArgs.safe) {
					getUserPluginLoader().then(async (clientPluginLoader) => {
						console.log("Loaded user plugins");
						await clientPluginLoader.run_load(pluginManager);
					});
				}
			});
		});
	},
	methods: {
		async openFile(abstractFile: AbstractInternalFile) : Promise<void> {
			//Don't edit folders
			if (abstractFile.folder) return;
			//Cast to a file
			let file : InternalFile = abstractFile as InternalFile;
			//Don't open the same file twice
			if (!this.openFiles[file.name]) {
				//Read the file
				await file.read();
				//Open the file in the editor
				Vue.set(this.openFiles, file.name, file);
			} else {
				this.focused_file = file;
			}
		},
		onOpenFileChange(fileData : InternalFile|undefined) : void {
			//Keep track of the currently focused file
			this.focused_file = fileData || undefined;
		},
		onEditorObjectChange(editor : ExtendedCodeEditorWrapper) : void {
			this.codeEditor = editor;
		},
		async save() : Promise<void> {
			if (this.focused_file) this.focused_file.write();
			else console.log(`No file open to save`);
		},
		download() : void {
			if (this.focused_file) {
				fileDownloader(this.focused_file.content || "", this.focused_file.name);
			} else {
				console.log(`No file open to download`);
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
					type: arg.type || 'string',
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
			let editorController: EditorController = new EditorController(this.codeEditor);

			let fsContainer : CustomFsContainer = await getFsContainer();

			//Run the function
			const funcParameters : PluginFunctionParameters = {
				args: args,
				editorController: editorController,
				ioController: this.ioController,
				runPanelController: runPanelController,
				fs: fsContainer.fs,
				path: fsContainer.path,
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
.code-editor {
	outline: 1px solid #AAA;
	width: 70%;
	display: inline-block;
}
</style>

<style scoped>
.editor {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
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