<template>
	<div class="editor">
		<div class="header filler">
			<div class="menubar-holder">
				<MenuBar :menus="menus" @run="runPluginFunc"/>
			</div>
			<div class="right">
				<button @click="openTreeViewer">Tree Viewer</button>
				<button @click="download" :disabled="!focused_file">Download File</button>
			</div>
		</div>

		<div class="body">
			<Container class="left filler">
				<!-- TODO: There must be a better way than this -->
				<label>
					<select v-model="cwd" class="cwd-dropdown">
						<option v-for="(opt, i) of parent_paths" :key="i">{{opt}}</option>
					</select>
				</label>
				<button @click="handleChangeRootClick">Change Root</button>
				<FilePicker :directory="cwd" :load-level="2" @change="(file) => openFile(file)"/>
			</Container>

			<Container class="middle code-editor no-scroll">
				<CodeEditorElement
					:focused="focused_file"
					@controller="onEditorControllerChange"
					@editorChange="onEditorObjectChange"
					@file-focus="onOpenFileChange"
				/>
			</Container>

			<Container class="right filler">
				<PluginToggler />
			</Container>
		</div>

		<Container class="footer">
			<run-panel />
		</Container>

		<InputPrompt @controller="c => this.ioController = c" />
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import fileDownloader from "js-file-download";
//Components
import CodeEditorElement from "@/components/CodeEditorElement.vue";
import Container from "@/components/Container.vue";
import FilePicker from "@/components/FilePicker.vue";
import MenuBar from "@/components/MenuBar.vue";
import PluginToggler from "@/components/PluginToggler.vue";
import RunPanel, { runPanelController } from "@/components/RunPanel.vue";
import InputPrompt from "@/components/InputPrompt.vue";
//Other imports
import {
	EditorController,
	ExtendedCodeEditorWrapper,
	IOController,
	PluginFunction,
	PluginFunctionParameters
} from "@whide/whide-types";
import { AbstractInternalFile, InternalFile } from "@/files/InternalFile";
import { fs } from "@/files/fs";
import { CustomDict } from "@/types/CustomDict";
import { InternalMenu } from "@/api/types/InternalMenus";
import { PluginInfo } from "@/api/PluginInfo";
import { pluginManager, vars } from "@/utils/globals";
import path from "path";

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	focused_file? : InternalFile;
	codeEditor? : ExtendedCodeEditorWrapper;
	editorController?: EditorController;
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
			codeEditor: undefined,
			editorController: undefined,
			ioController: undefined,
			cwd: vars.cwd,
		}
	},
	computed: {
		menus() : InternalMenu[] {
			return pluginManager.menuManager.menus;
		},
		parent_paths() : string[] {
			return this.getPaths(this.cwd);
		}
	},
	methods: {
		openTreeViewer() {
			let routeData = this.$router.resolve({ path: '/trees' });
			window.open(routeData.href, '_blank', "height=700");
		},
		async openFile(abstractFile: AbstractInternalFile) : Promise<void> {
			if (!this.editorController) throw new Error("Couldn't get editor controller instance");
			this.editorController.open(abstractFile.fullPath);
		},
		onOpenFileChange(fileData : InternalFile|undefined) : void {
			//Keep track of the currently focused file
			this.focused_file = fileData || undefined;
		},
		onEditorControllerChange(editorController : EditorController) : void {
			this.editorController = editorController;
		},
		onEditorObjectChange(editor : ExtendedCodeEditorWrapper) : void {
			this.codeEditor = editor;
		},
		download() : void {
			if (this.focused_file) {
				fileDownloader(this.focused_file.content || "", this.focused_file.name);
			} else {
				console.log(`No file open to download`);
			}
		},
		getPaths(filePath: string) : string[] {
			let r = [filePath];
			while (filePath && filePath !== '/') {
				filePath = path.dirname(filePath);
				r.push(filePath);
			}
			return r;
		},
		handleChangeRootClick() {
			if (!this.ioController) throw new Error("Couldn't get IO Controller");
			this.ioController.getInput({
				title: "Choose folder root",
				message: "Select the folder to use as the new directory root",
				type: "folder"
			}).then((folder?: string) => {
				if (!folder) return;
				this.cwd = folder;
			})
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
					title: arg.name,
					message: arg.description || "",
					type: arg.type || 'string',
					//Allow empty optional arguments, or validate the input
					validator: async (s: string) => arg.optional && !s || await validator(s),
				});
				//End here if the user presses cancel
				if (val === undefined) return;
				//Otherwise store the value
				args[arg.name] = val;
			}

			//Make sure the code editor and controller are defined (these should never happen)
			if (!this.codeEditor) throw new Error("Couldn't get code editor instance");
			if (!this.editorController) throw new Error("Couldn't get editor controller instance");

			//Run the function
			const funcParameters : PluginFunctionParameters = {
				args: args,
				editorController: this.editorController,
				ioController: this.ioController,
				runPanelController: runPanelController,
				fs: fs,
				config: data.plugin.makeSettingsObj(),
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

.no-scroll {
	overflow: hidden;
}

.body {
	flex: 1;
	display: flex;
	min-height: 0;
	height: 100%;
}
.body .left {
	min-width: 10em;
	width: 10%;
}
.body .right {
	min-width: 10em;
	width: 15%;
}
.body .middle {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.footer {
	height: fit-content;
	max-height: 30%;
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