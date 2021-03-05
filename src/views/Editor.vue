<template>
	<div class="editor">
		<div class="header filler">
			<div class="menubar-holder">
				<MenuBar :menus="menus" @run="runPluginFunc"/>
			</div>
			<div class="right">
				<button @click="openTreeViewer">Tree Viewer</button>
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
				<PluginToggler />
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
import { pluginManager, vars } from "@/utils/globals";

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	focused_file? : InternalFile;
	openFiles : CustomDict<InternalFile>;
	codeEditor? : CodeEditorWrapper;
	ioController? : IOController;
	cwd: string;
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
			focused_file: undefined,
			openFiles: {},
			codeEditor: undefined,
			ioController: undefined,
			cwd: vars.cwd,
		}
	},
	computed: {
		menus() : Menu[] {
			return pluginManager.menuManager.menus;
		},
	},
	methods: {
		openTreeViewer() {
			window.open('/trees', '_blank', "height=400");
		},
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