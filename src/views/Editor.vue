<template>
	<div class="full-height">
		<v-app-bar app dense flat class="header">
			<div class="menubar-holder">
				<MenuBar :menus="menus" />
			</div>

			<v-spacer></v-spacer>

			<v-btn @click="toggleTheme">
				<font-awesome-icon
					:icon="isDarkTheme?'sun':'moon'"
					:title="`switch to ${isDarkTheme?'light':'dark'} theme`"
				/>
			</v-btn>

			<v-spacer></v-spacer>

			<v-btn right @click="openTreeViewer">Tree Viewer</v-btn>
		</v-app-bar>

		<v-navigation-drawer app>
			<v-btn @click="handleChangeRootClick">Change Root</v-btn>
			<FilePicker :directory="cwd" :load-level="2" @change="(file) => openFile(file)" @dir="dirChange"/>
		</v-navigation-drawer>

		<v-main class="pa-0 full-height">
			<CodeEditorElement
				:focused="focused_file"
				:allow-extended="extendedWhile"
				@controller="onEditorControllerChange"
				@editorChange="onEditorObjectChange"
				@fileFocus="onFocusedFileChange"
			/>
		</v-main>

		<v-navigation-drawer app right>
			Options:
			<v-switch ref="pureWhileToggle" v-model="extendedWhile" :label="`${extendedWhile ? 'Extended' : 'Pure'} WHILE`" />
		</v-navigation-drawer>

		<v-app-bar app bottom>
			<run-panel @controller="c => this.runPanelController = c" />
		</v-app-bar>

		<InputPrompt @controller="c => this.ioController = c" />
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
}

export default Vue.extend({
	name: 'Editor',
	components: {
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
				{
					name: "Run",
					children: [
						{
							name: "Run",
							args: [{
								name: "Input Expression",
								description: "Expression to pass as input to the program",
								type: "tree",
							}],
							command: async ({ args }) => {
								if (!this.ioController) throw new Error("Couldn't get IO Controller");
								if (!this.runPanelController) throw new Error("Couldn't get Run Panel Controller");
								if (!this.focused_file) {
									this.ioController.prompt({
										title: 'No file to run',
										message: 'Open a file and try again'
									});
									return;
								}
								//Open a new tab in the run panel
								const outputController = await this.runPanelController!.addOutputStream(
									`${this.focused_file!.name} ${args['Input Expression']}`
								);
								//Create a runner for the program
								const runner = new HWhileRunner({
									expression: args['Input Expression'],
									file: this.focused_file ? this.focused_file.fullPath : 'none',
									hwhile: 'hwhile',
									output: outputController.stream,
								});
								//Perform setup
								await runner.init();
								//Run the program
								await runner.run();
							}
						},
						{
							name: "Debug",
							args: [{
								name: "Input Expression",
								description: "Expression to pass as input to the program",
								type: "tree",
							}],
							command: async ({ args }) => {
								if (!this.ioController) throw new Error("Couldn't get IO Controller");
								if (!this.runPanelController) throw new Error("Couldn't get Run Panel Controller");
								if (!this.editorController) throw new Error("Couldn't get Editor Controller");
								if (!this.focused_file) {
									this.ioController.prompt({
										title: 'No file to run',
										message: 'Open a file and try again'
									});
									return;
								}
								//Open a new tab in the run panel
								const outputController = await this.runPanelController.addOutputStream(
									`${this.focused_file.name} ${args['Input Expression']}`
								);
								//Start a debugger
								const runner = new HWhileDebugger({
									expression: args['Input Expression'],
									file: this.focused_file.fullPath,
									hwhile: 'hwhile',
									output: outputController.stream,
									breakpoints: this.editorController.getBreakpoints(),
								});
								//Set up user control for the debugger
								outputController.debuggerCallbackHandler = runner;
								//Setup
								await runner.init();
								//Run to the first breakpoint
								let state = await runner.run();
								if (state && state.variables)
									outputController.setVariablesFromMap(state.variables);
							}
						},
						{
							name: "Run (While.js)",
							args: [{
								name: "Input Expression",
								description: "Expression to pass as input to the program",
								type: "tree",
							}],
							command: async ({ args }) => {
								if (!this.ioController) throw new Error("Couldn't get IO Controller");
								if (!this.runPanelController) throw new Error("Couldn't get Run Panel Controller");
								if (!this.focused_file) {
									this.ioController.prompt({
										title: 'No file to run',
										message: 'Open a file and try again'
									});
									return;
								}
								//Open a new tab in the run panel
								const outputController = await this.runPanelController!.addOutputStream(
									`${this.focused_file!.name} ${args['Input Expression']}`
								);
								//Create a runner for the program
								const runner = new WhileJsRunner({
									expression: args['Input Expression'],
									file: this.focused_file ? this.focused_file.fullPath : 'none',
									output: outputController.stream,
								});
								//Perform setup
								await runner.init();
								//Run the program
								await runner.run();
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
		openSettings() {
			let routeData = this.$router.resolve({ path: '/settings' });
			window.open(routeData.href, '_blank');
		},
		async openFile(abstractFile: AbstractInternalFile) : Promise<void> {
			if (!this.editorController) throw new Error("Couldn't get editor controller instance");
			this.editorController.open(abstractFile.fullPath);
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
		}
	}
});
</script>

<style scoped>
.full-height {
	height: 100%;
}
</style>