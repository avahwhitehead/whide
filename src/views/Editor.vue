<template>
	<div class="full-height">
		<v-app-bar app dense flat clipped-left clipped-right class="header">
			<v-col md="3" sm="5">
				<MenuBar :menus="menus" style="max-width: max-content" />
			</v-col>

			<v-spacer />

			<v-btn right @click="openTreeViewer">
				Open Tree Viewer
<!--				<FontAwesomeIcon icon="project-diagram" />-->
			</v-btn>

			<v-spacer />

			<v-col md="3" sm="5" >
				<v-row>
					<v-btn class="pa-2 program-button edit" depressed @click="openRunConfigPopup" >
						<FontAwesomeIcon icon="cog" />
					</v-btn>

					<v-select
						v-model="chosenRunConfig"
						:items="runConfigs"
						item-text="name"
						item-value="abbr"
						placeholder="Run Configuration"
						class="dropdown"
						return-object
						dense
						outlined
						hide-details
					/>

					<v-btn
						class="pa-2 program-button run"
						:disabled="!allowRunning"
						depressed @click="runProgramClick"
					>
						<FontAwesomeIcon icon="play" />
					</v-btn>

					<v-btn
						class="pa-2 program-button debug"
						:disabled="!allowDebugging"
						depressed @click="debugProgramClick"
					>
						<FontAwesomeIcon icon="bug" />
					</v-btn>
				</v-row>
			</v-col>
		</v-app-bar>

		<v-navigation-drawer app permanent clipped>
			<v-btn @click="handleChangeRootClick">Change Root</v-btn>
			<FilePicker :directory="cwd" :load-level="2" @change="(file) => openFile(file)" @dir="dirChange"/>
		</v-navigation-drawer>

		<v-main class="pa-0 fill-height overflow-hidden">
			<CodeEditorElement
				class="top"
				:focused="focused_file"
				:allow-extended="extendedWhile"
				@controller="onEditorControllerChange"
				@editorChange="onEditorObjectChange"
				@fileFocus="onFocusedFileChange"
			/>

			<div class="bottom">
				<v-divider />
				<run-panel class="run-panel" @controller="c => this.runPanelController = c" />
			</div>
		</v-main>

		<v-navigation-drawer app right clipped>
			<v-btn right @click="showSettingsPopup = !showSettingsPopup">Global Settings</v-btn>

			<div class="title pt-2 pb-0">Options</div>
			<v-switch class="mt-0" ref="pureWhileToggle" v-model="extendedWhile" :label="`${extendedWhile ? 'Extended' : 'Pure'} WHILE`" />
		</v-navigation-drawer>

		<InputPrompt @controller="c => this.ioController = c" />
		<RunConfigPopup v-model="showRunConfigPopup" />
		<SettingsPopup v-model="showSettingsPopup" />
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import fileDownloader from "js-file-download";
//Components
import CodeEditorElement from "@/components/CodeEditorElement.vue";
import FilePicker from "@/components/FilePicker.vue";
import MenuBar from "@/components/MenuBar.vue";
import RunPanel from "@/components/RunPanel.vue";
import InputPrompt from "@/components/InputPrompt.vue";
import RunConfigPopup from "@/components/RunConfigPopup.vue";
//Other imports
import { EditorController, IOController, Menu, RunPanelController } from "@/types";
import { AbstractInternalFile, InternalFile } from "@/files/InternalFile";
import { vars } from "@/utils/globals";
import path from "path";
import { fs } from "@/files/fs";
import CodeMirror from "codemirror";
import { CustomDict } from "@/types/CustomDict";
import { Stats } from "fs";
import { HWhileDebugger, HWhileRunner } from "@/run/hwhile/HWhileRunConfiguration";
import { WhileJsRunner } from "@/run/whilejs/WhileJsRunConfiguration";
import { AbstractRunner } from "@/run/AbstractRunner";
import { INTERPRETERS, RunConfiguration } from "@/types/RunConfiguration";
import SettingsPopup from "@/components/SettingsPopup.vue";

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	focused_file? : InternalFile;
	codeEditor? : CodeMirror.Editor;
	editorController?: EditorController;
	ioController? : IOController;
	runPanelController?: RunPanelController;
	cwd: string;
	extendedWhile: boolean;
	showRunConfigPopup: boolean;
	showSettingsPopup: boolean;
}

export default Vue.extend({
	name: 'Editor',
	components: {
		SettingsPopup,
		RunConfigPopup,
		InputPrompt,
		FilePicker,
		CodeEditorElement,
		MenuBar,
		RunPanel,
	},
	data() : DataTypesDescriptor {
		return {
			focused_file: undefined,
			codeEditor: undefined,
			editorController: undefined,
			ioController: undefined,
			runPanelController: undefined,
			cwd: vars.cwd,
			extendedWhile: true,
			showRunConfigPopup: false,
			showSettingsPopup: false,
		}
	},
	computed: {
		isDarkTheme: {
			get(): boolean {
				return this.$vuetify.theme.dark;
			},
			set(val: boolean): void {
				this.$vuetify.theme.dark = val;
			}
		},
		chosenRunConfig: {
			get(): RunConfiguration|undefined {
				return this.$store.state.chosenRunConfig;
			},
			set(val: RunConfiguration|undefined): void {
				this.$store.commit('setChosenRunConfig', val);
			}
		},
		runConfigs: {
			get(): RunConfiguration[] {
				return this.$store.state.runConfigurations;
			}
		},
		allowDebugging(): boolean {
			return !!this.chosenRunConfig && this.chosenRunConfig.interpreter !== INTERPRETERS.WHILE_JS;
		},
		allowRunning(): boolean {
			return !!this.chosenRunConfig;
		},
		menus() : Menu[] {
			const _displayError = async (error: string) => {
				console.error(error);
				if (!this.ioController) {
					console.error("Couldn't get IO Controller");
					return;
				}
				await this.ioController.showOutput({
					message: error,
					title: "An error occurred"
				});
			}
			const _displaySuccess = async (msg: string) => {
				console.log(msg);
				if (!this.ioController) {
					console.error("Couldn't get IO Controller");
					return;
				}
				await this.ioController.showOutput({
					message: msg,
					title: "Success"
				});
			}

			return [
				{
					name: "File",
					children: [
						{
							name: "New",
							children: [
								{
									name: "New File",
									args: [
										{
											name: "Parent Folder",
											description: "Choose the folder to hold the file",
											type: 'folder',
										},
										{
											name: "File Name",
											description: "Name of the file",
											validator: function (name) {
												return !!name.match(/^[a-zA-Z0-9_ \-.]+$/);
											},
										}
									],
									command({args} : { args: CustomDict<string> }) {
										const parent = args["Parent Folder"];
										const name = args["File Name"];
										//Build the full file path
										const full_path = path.join(parent, name);

										try {
											//Check the file doesn't already exist
											if (fs.existsSync(full_path)) {
												_displayError(`The file "${name}" already exists in "${parent}"`);
												return;
											}
											//Create the file
											fs.writeFile(full_path, "", err => {
												if (err) _displayError(err.message);
												else console.log(`Successfully created file "${full_path}"`);
											});
											_displaySuccess("File created successfully");
										} catch (e) {
											_displayError(e);
										}
									}
								},
								{
									name: "New Folder",
									args: [
										{
											name: "Parent Folder",
											description: "Choose the folder to hold the new folder",
											type: 'folder',
										},
										{
											name: "Folder Name",
											description: "Name of the folder",
											validator(name) {
												return !!name.match(/^[a-zA-Z0-9_ \-.]+$/);
											},
										}
									],
									command({args} : { args: CustomDict<string> }) {
										const parent = args["Parent Folder"];
										const name = args["Folder Name"];
										//Build the full directory path
										const full_path = path.join(parent, name);

										try {
											//Check the folder doesn't already exist
											if (fs.existsSync(full_path)) {
												_displayError(`The folder "${name}" already exists in "${parent}"`);
												return;
											}
											//Create the folder
											fs.mkdir(full_path, err => {
												if (err) _displayError(err.message);
												else console.log(`Successfully created folder "${full_path}"`);
											});
											_displaySuccess("Folder created successfully");
										} catch (e) {
											_displayError(e);
										}
									}
								}
							]
						},
						{
							name: "Save",
							command: () => {
								this.editorController!.saveFiles();
							}
						},
						{
							name: "Delete",
							args: [{
								name: "Path",
								description: "Choose the file/folder to delete",
								type: 'path',
							}],
							command({args} : { args: CustomDict<string> }) {
								const full_path = args["Path"];

								try {
									let stat: Stats = fs.statSync(full_path);
									//Delete the file or folder at the path
									if (stat.isDirectory()) fs.rmdirSync(full_path);
									else fs.unlinkSync(full_path);

									_displaySuccess("File deleted");
								} catch (e) {
									_displayError(e);
								}
							}
						},
						{
							name: "Download",
							command: () => {
							if (this.focused_file) {
								fileDownloader(this.focused_file.content || "", this.focused_file.name);
							} else {
								if (!this.ioController) {
									console.error("Error: Couldn't get IO Controller");
									return;
								}
								this.ioController.prompt({
									title: 'No file to download',
									message: 'Open a file and try again',
									options: ['Ok']
								});
							}
						}
						},
					]
				},
			];
		},
	},
	methods: {
		openTreeViewer() {
			let routeData = this.$router.resolve({ path: '/trees' });
			window.open(routeData.href, '_blank');
		},
		async openFile(abstractFile: AbstractInternalFile) : Promise<void> {
			if (!this.editorController) throw new Error("Couldn't get editor controller instance");
			this.editorController.open(abstractFile.fullPath);
		},

		async runProgramClick() {
			if (!this.runPanelController) throw new Error("Couldn't get Run Panel Controller");
			if (!this.chosenRunConfig) throw new Error("No run configuration selected");

			let config = this.chosenRunConfig;
			let inputExpression = config.input;

			//Open a new tab in the run panel
			const outputController = await this.runPanelController!.addOutputStream(config.name);

			let runner: AbstractRunner;

			if (config.interpreter === INTERPRETERS.WHILE_JS) {
				//Create a While.js runner for the program
				runner = new WhileJsRunner({
					expression: inputExpression,
					file: config.file,
					output: outputController.stream,
				});
			} else {
				//Create an HWhile runner for the program
				runner = new HWhileRunner({
					expression: inputExpression,
					file: config.file,
					hwhile: this.$store.state.settings.general.hwhilePath || 'hwhile',
					output: outputController.stream,
				});
			}
			//Perform setup
			await runner.init();
			//Run the program
			await runner.run();
		},

		async debugProgramClick() {
			if (!this.runPanelController) throw new Error("Couldn't get Run Panel Controller");
			if (!this.editorController) throw new Error("Couldn't get Editor Controller");
			if (!this.chosenRunConfig) throw new Error("No run configuration selected");

			let config = this.chosenRunConfig;
			let inputExpression = config.input;

			//Open a new tab in the run panel
			const outputController = await this.runPanelController!.addOutputStream(config.name);

			let runner: AbstractRunner;

			if (config.interpreter === INTERPRETERS.WHILE_JS) {
				throw new Error("Can't debug with While.js");
			} else {
				//Create an HWhile runner for the program
				runner = new HWhileDebugger({
					expression: inputExpression,
					file: config.file,
					hwhile: this.$store.state.settings.general.hwhilePath || 'hwhile',
					output: outputController.stream,
					//TODO: Add back support for breakpoints
					// breakpoints: this.editorController.getBreakpoints(),
				});
				//Set up user control for the debugger
				outputController.debuggerCallbackHandler = runner as HWhileDebugger;
				//Setup
				await runner.init();
				//Run to the first breakpoint
				let state = await runner.run();
				if (state && state.variables)
					outputController.setVariablesFromMap(state.variables);
			}
			//Perform setup
			await runner.init();
			//Run the program
			await runner.run();
		},

		openRunConfigPopup() {
			this.showRunConfigPopup = true;
		},

		onFocusedFileChange(fileData : InternalFile|undefined) : void {
			//Keep track of the currently focused file
			this.focused_file = fileData || undefined;
		},
		onEditorControllerChange(editorController : EditorController) : void {
			this.editorController = editorController;
		},
		onEditorObjectChange(editor : CodeMirror.Editor) : void {
			this.codeEditor = editor;
		},
		dirChange(dir: string) {
			//Change the working directory
			this.cwd = dir;
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
		toggleTheme() {
			this.isDarkTheme = !this.isDarkTheme;
		}
	},
	watch: {
		cwd(cwd: string): void {
			vars.cwd = cwd;
		},
		runConfigs: {
			deep: true,
			handler(val: RunConfiguration[]) {
				if (val.length > 0)
					this.$store.chosenRunConfig = val[0];
				else
					this.$store.chosenRunConfig = undefined;
			}
		}
	}
});
</script>

<!--suppress CssUnusedSymbol -->
<style>
/*
Fix for dropdown width. See:
https://github.com/vuetifyjs/vuetify/issues/6275#issuecomment-577148939
*/
.v-select__selections input {
	width: 0 !important;
	max-width: 0 !important;
}
.v-select__selections .v-select__selection {
	max-width: none;
}
</style>

<style scoped>
.full-height {
	height: 100%;
}

.dropdown {
	/*Display next to the button, filling the available space*/
	flex: 1;
}
.program-button {
	min-width: 1em !important;
	/*padding: 5px !important;*/
	margin-top: 2px;
	text-align: center;
}

.top, .bottom {
	/*Stack one on top of the other*/
	position: absolute;
	/*Fill the width*/
	width: 100%;
	left: 0;
	right: 0;
	/*Scroll on overflow*/
	overflow-y: auto;
}

.top {
	/*Align to the top*/
	top: 0;
	/*Take up most of the space*/
	height: 65%;
	max-height: 65%;
}

.bottom {
	/*Align to the bottom*/
	bottom: 0;
	/*Fill the remaining space*/
	height: 35%;
	max-height: 35%;
	/*Resize contents to make room for the divider*/
	display: flex;
	flex-direction: column;
}

.run-panel {
	flex: 1;
}
</style>