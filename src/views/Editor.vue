<template>
	<div class="full-height">
		<v-app-bar app dense flat clipped-left clipped-right class="header">
			<MenuBar
				:menus="menus"
				style="max-width: max-content"
				v-if="!isElectron"
			/>

			<v-spacer v-if="!isElectron" />
			<v-spacer v-if="!isElectron" />

			<v-btn right @click="openTreeViewer">
				Open Tree Viewer
			</v-btn>

			<v-spacer />
			<v-spacer v-if="isElectron" />
			<v-spacer v-if="isElectron" />

			<v-btn class="pa-2 program-button edit" depressed @click="openRunConfigPopup" >
				<FontAwesomeIcon icon="pencil-alt" />
			</v-btn>

			<v-select
				v-model="chosenRunConfig"
				:items="runConfigs"
				item-text="name"
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
				depressed
				@click="runProgramClick"
			>
				<FontAwesomeIcon icon="play" />
			</v-btn>

			<v-btn
				class="pa-2 program-button debug"
				:disabled="!allowDebugging"
				depressed
				@click="debugProgramClick"
			>
				<FontAwesomeIcon icon="bug" />
			</v-btn>
		</v-app-bar>

		<v-navigation-drawer app permanent clipped :width="fileViewerWidth" ref="filePanel">
			<v-btn @click="handleChangeRootClick">Change Root</v-btn>
			<FilePicker :directory="cwd" @changeFile="openFile" />
		</v-navigation-drawer>

		<v-main class="pa-0 fill-height overflow-hidden main-container">
			<CodeEditorElement
				class="top"
				:class="{'full-height': !showRunPanel}"
				:style="{'height': codeEditorHeight}"
				@controller="onEditorControllerChange"
			/>

			<div class="bottom" ref="runPanel"
				:class="{'hidden': !showRunPanel}"
				:style="{'height': runPanelHeightString}"
			>
				<v-divider />
				<run-panel class="run-panel" :runners="runners" />
			</div>
		</v-main>

		<v-navigation-drawer app right clipped v-model="showPopout">
			<v-btn
				right
				@click="showSettingsPopup"
				v-text="`Global Settings`"
			/>

			<div class="title pt-2 pb-0">Options</div>
			<v-switch
				class="mt-0"
				ref="pureWhileToggle"
				v-model="extendedWhile"
				:label="`${extendedWhile ? 'Extended' : 'Pure'} WHILE`"
				:disabled="focusedFile === undefined"
			/>

			<v-btn
				absolute
				left
				shaped
				min-width="5px"
				width="5px"
				@click="showPopout = !showPopout"
				:style="{top: '8%', transform:'translateX(-150%)', visibility: 'visible !important'}"
			>
				<FontAwesomeIcon :icon="showPopout ? 'angle-right' : 'angle-left'"/>
			</v-btn>
		</v-navigation-drawer>

		<DownloadFilePopup v-model="showDownloadPopup" />
		<ChangeRootPopup
			v-model="showChangeRootPopup"
			v-if="isNotElectron"
		/>
		<NewFilePopup
			v-model="showNewFilePopup"
			v-if="isNotElectron"
			:create-folder="createFolder"
			@created="onFileCreate"
		/>
		<DeleteFilePopup v-model="showDeleteFilePopup" />
	</div>
</template>


<script lang="ts">
import Vue from "vue";
//Components
import CodeEditorElement from "@/components/CodeEditorElement.vue";
import FilePicker from "@/components/FilePicker.vue";
import MenuBar from "@/components/MenuBar.vue";
import RunPanel from "@/components/RunPanel.vue";
import DownloadFilePopup from "@/components/DownloadFilePopup.vue";
import ChangeRootPopup from "@/components/ChangeRootPopup.vue";
import NewFilePopup from "@/components/NewFilePopup.vue";
import DeleteFilePopup from "@/components/DeleteFilePopup.vue";
//Other imports
import { EditorController, IOController, Menu } from "@/types";
import CodeMirror from "codemirror";
import { HWhileDebugger, HWhileRunner } from "@/run/hwhile/HWhileRunConfiguration";
import { WhileJsRunner } from "@/run/whilejs/WhileJsRunConfiguration";
import { AbstractRunner } from "@/run/AbstractRunner";
import { INTERPRETERS, RunConfiguration } from "@/types/RunConfiguration";
import interact from "interactjs";
import { FileInfoState } from "@/types/FileInfoState";
import { MessageBoxOptions, OpenDialogReturnValue, SaveDialogReturnValue } from "electron";
import path from "path";
import { fs } from "@/files/fs";

const electron = (window['require'] !== undefined) ? require("electron") : undefined;

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	codeEditor? : CodeMirror.Editor;
	editorController?: EditorController;
	ioController? : IOController;
	runners: {name:string, runner:AbstractRunner}[],
	showChangeRootPopup: boolean;
	showDeleteFilePopup: boolean;
	showNewFilePopup: boolean;
	createFolder: boolean;
	showDownloadPopup: boolean;
	showPopout: boolean|undefined;
	fileViewerWidth: number;
	runPanelHeight: number;
}

export default Vue.extend({
	name: 'Editor',
	components: {
		DeleteFilePopup,
		DownloadFilePopup,
		ChangeRootPopup,
		FilePicker,
		CodeEditorElement,
		MenuBar,
		RunPanel,
		NewFilePopup,
	},
	data() : DataTypesDescriptor {
		return {
			editorController: undefined,
			ioController: undefined,
			runners: [],
			showChangeRootPopup: false,
			showDeleteFilePopup: false,
			showNewFilePopup: false,
			createFolder: false,
			showDownloadPopup: false,
			showPopout: undefined,
			fileViewerWidth: 200,
			runPanelHeight: 200,
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
		focusedFile(): FileInfoState|undefined {
			const focusedFile = this.$store.state.focusedFile;
			const openFiles = this.$store.state.openFiles;
			if (focusedFile === -1) return undefined;
			return openFiles[focusedFile];
		},
		extendedWhile: {
			get(): boolean {
				if (this.focusedFile === undefined) return true;
				return this.focusedFile.extWhile;
			},
			set(val: boolean): void {
				this.$store.commit('openFiles.focused.setExtended', val);
			},
		},
		allowDebugging(): boolean {
			return !!this.chosenRunConfig && this.chosenRunConfig.interpreter !== INTERPRETERS.WHILE_JS;
		},
		allowRunning(): boolean {
			return !!this.chosenRunConfig;
		},
		showRunPanel(): boolean {
			return this.runners.length !== 0;
		},
		codeEditorHeight(): string {
			if (!this.showRunPanel) return '100%';
			return `calc(100% - ${this.runPanelHeightString})`;
		},
		runPanelHeightString(): string {
			if (!this.showRunPanel) return '0';
			return this.runPanelHeight + 'px';
		},
		menus() : Menu[] {
			return [
				{
					name: "File",
					children: [
						{
							name: "New",
							children: [
								{
									name: "New File",
									command: this.menu_newFile_click,
								},
								{
									name: "New Folder",
									command: this.menu_newFolder_click,
								}
							]
						},
						{
							name: "Save",
							command: this.menu_save_click,
						},
						{
							name: "Delete",
							command: this.menu_delete_click,
						},
						{
							name: "Export",
							command: this.menu_export_click,
						},
					]
				},
			];
		},
		cwd: {
			get(): string {
				return this.$store.state.current_directory;
			},
			set(cwd: string): void {
				this.$store.commit('cwd.set', cwd);
			},
		},
		isElectron(): boolean {
			return this.$store.state.isElectron;
		},
		isNotElectron(): boolean {
			return !this.isElectron;
		},
	},
	destroyed() {
		//Remove global event listeners before destroying the element
		if (electron) {
			electron.ipcRenderer.off('file.new-file', this.menu_newFile_click);
			electron.ipcRenderer.off('file.new-folder', this.menu_newFolder_click);
			electron.ipcRenderer.off('file.save', this.menu_save_click);
			electron.ipcRenderer.off('file.delete', this.menu_delete_click);
			electron.ipcRenderer.off('file.settings', this.menu_settings_click);
		} else {
			window.removeEventListener('keydown', this.handleKeypress);
		}
	},
	mounted() {
		//Set up listeners for the menus in electron, or keyboard shortcuts in the browser
		if (electron) {
			//Perform operations when menu items are clicked
			electron.ipcRenderer.on('file.new-file', this.menu_newFile_click);
			electron.ipcRenderer.on('file.new-folder', this.menu_newFolder_click);
			electron.ipcRenderer.on('file.save', this.menu_save_click);
			electron.ipcRenderer.on('file.delete', this.menu_delete_click);
			electron.ipcRenderer.on('file.settings', this.menu_settings_click);
		} else {
			//Handler for keypress events
			window.addEventListener('keydown', this.handleKeypress);
		}

		const that = this;
		//Make the file viewer drawer resizable
		interact(this.$refs.filePanel.$el).resizable({
			edges: { right: true },
			listeners: {
				move(event: any) {
					const SNAP_DISTANCE = 50;
					that.fileViewerWidth = Math.ceil(event.rect.width / SNAP_DISTANCE) * SNAP_DISTANCE;
				}
			}
		});
		//Make the run panel resizable
		interact(this.$refs.runPanel).resizable({
			edges: { top: true },
			listeners: {
				move(event: any) {
					const SNAP_DISTANCE = 10;
					that.runPanelHeight = Math.ceil(event.rect.height / SNAP_DISTANCE) * SNAP_DISTANCE;
				}
			}
		});
	},
	methods: {
		/**
		 * Get the next available run controller name starting with a given string
		 * @param prefix	The starting string
		 */
		_nextRunnerName(prefix: string = 'Run') {
			let nextName: string = prefix;
			//Set of names starting with this prefix
			let nameSet: Set<string> = new Set(
				this.runners.map(e => e.name).filter(n => n.substr(0, prefix.length) === prefix)
			);
			//Start with the number of the length of the set
			let start: number = 0;
			while (nameSet.has(nextName)) nextName = `${prefix} (${++start})`;
			return nextName;
		},
		openTreeViewer() {
			let routeData = this.$router.resolve({ path: '/trees' });
			window.open(routeData.href, '_blank');
		},
		async openFile(filePath: string) : Promise<void> {
			if (!this.editorController) throw new Error("Couldn't get editor controller instance");
			this.editorController.open(filePath);
		},
		async runProgramClick() {
			if (!this.chosenRunConfig) throw new Error("No run configuration selected");

			let config = this.chosenRunConfig;
			let inputExpression = config.input;

			let runner: AbstractRunner;

			if (config.interpreter === INTERPRETERS.WHILE_JS) {
				//Create a While.js runner for the program
				runner = new WhileJsRunner({
					expression: inputExpression,
					file: config.file,
				});
			} else {
				//Create an HWhile runner for the program
				runner = new HWhileRunner({
					expression: inputExpression,
					file: config.file,
					hwhile: this.$store.state.settings.general.hwhilePath || 'hwhile',
					onerror: this._handleRunDebugError,
				});
			}

			//Open a new tab in the run panel
			this.runners.push({name: this._nextRunnerName(config.name), runner: runner});

			//Perform setup
			await runner.init();
			//Run the program
			await runner.run();
		},
		async debugProgramClick() {
			if (!this.editorController) throw new Error("Couldn't get Editor Controller");
			if (!this.chosenRunConfig) throw new Error("No run configuration selected");

			let config = this.chosenRunConfig;
			let inputExpression = config.input;

			let runner: AbstractRunner;

			//Get the breakpoints configured for the file
			let runFileState: FileInfoState|undefined = this.$store.state.openFiles.find((f: FileInfoState) => f.path === config.file);

			let breakpoints: { line: number; prog: string }[];
			if (!runFileState) breakpoints = [];
			else breakpoints = this.getBreakpointsInFolder(path.resolve(runFileState!.path, '..'));

			if (config.interpreter === INTERPRETERS.WHILE_JS) {
				throw new Error("Can't debug with While.js");
			} else {
				//Create an HWhile runner for the program
				runner = new HWhileDebugger({
					expression: inputExpression,
					file: config.file,
					hwhile: this.$store.state.settings.general.hwhilePath || 'hwhile',
					breakpoints: breakpoints,
					onerror: this._handleRunDebugError,
				});
			}

			//Open a new tab in the run panel
			this.runners.push({name: this._nextRunnerName(config.name), runner: runner});

			//Perform setup
			await runner.init();
			//Run to the first breakpoint
			await runner.run();
		},
		_handleRunDebugError(err: any): void {
			if (err.code === 'ENOENT') {
				this.showHWhileNotFoundError();
			} else {
				console.error(err)
			}
		},
		onFileCreate(filePath: string, isFolder: boolean) {
			if (this.editorController && !isFolder) {
				this.editorController.open(filePath);
			}
		},
		onEditorControllerChange(editorController : EditorController) : void {
			this.editorController = editorController;
		},
		dirChange(dir: string) {
			//Change the working directory
			this.cwd = dir;
		},
		handleChangeRootClick() {
			if (electron) {
				electron.remote.dialog.showOpenDialog({
					properties: ['openDirectory']
				}).then((result: OpenDialogReturnValue) => {
					this.cwd = result.filePaths[0];
				})
			} else {
				this.showChangeRootPopup = true;
			}
		},
		toggleTheme() {
			this.isDarkTheme = !this.isDarkTheme;
		},

		handleKeypress(e: KeyboardEvent) {
			//Whether ctrl (Linux/Windows) or cmd (Mac) is pressed
			const isCtrl = (navigator.platform.match("Mac") ? e.metaKey : e.ctrlKey);

			if (isCtrl) {
				if (e.key === 's') {
					//Save files
					this.editorController?.saveFiles();
				} else {
					//Do nothing
					return;
				}
				//Prevent any browser actions linked to this key combination
				//This will only be reached if an action has been performed
				e.preventDefault();
			}
		},

		showHWhileNotFoundError(): void {
			const title = `Could not find HWhile`;
			const message = `Please ensure HWhile is installed on your computer and available on the global path,`
				+ ` or set the path to the HWhile executable in settings.`;
			if (electron) {
				let opts: MessageBoxOptions = {
					title,
					message,
					buttons: ['Ok'],
				};
				electron.remote.dialog.showMessageBox(opts);
			} else {
				window.alert(title + '\n' + message);
			}
		},

		menu_newFile_click() {
			if (electron) {
				let filePathPromise: Promise<SaveDialogReturnValue> = electron.remote.dialog.showSaveDialog(null, {
					defaultPath: path.join(this.cwd, 'myfile.while'),
					filters: [
						{ name: 'WHILE files', extensions: ['while'] },
						{ name: 'All files', extensions: ['*'] },
					],
					properties: ['showOverwriteConfirmation', 'createDirectory']
				});
				filePathPromise.then((value: SaveDialogReturnValue) => {
					if (value.canceled) return;
					fs.promises.writeFile(value.filePath!, '');
				});
			} else {
				this.createFolder = false;
				this.showNewFilePopup = true;
			}
		},
		menu_newFolder_click() {
			if (electron) {
				let filePathPromise: Promise<SaveDialogReturnValue> = electron.remote.dialog.showSaveDialog(null, {
					defaultPath: path.join(this.cwd, 'folder'),
					buttonLabel: 'Create',
				});
				filePathPromise.then((value: SaveDialogReturnValue) => {
					if (value.canceled) return;
					fs.promises.mkdir(value.filePath!);
				});
			} else {
				this.createFolder = true;
				this.showNewFilePopup = true;
			}
		},
		menu_save_click() {
			this.editorController?.saveFiles();
		},
		menu_delete_click() {
			this.showDeleteFilePopup = true;
		},
		menu_export_click() {
			this.showDownloadPopup = true;
		},
		menu_settings_click() {
			this.showSettingsPopup();
		},

		showSettingsPopup(): void {
			let routeData = this.$router.resolve({ path: '/settings' });
			window.open(routeData.href, '_blank',`width=800px,height=400px,location=no`);
		},

		openRunConfigPopup(): void {
			let routeData = this.$router.resolve({ path: '/configurations' });
			window.open(routeData.href, '_blank',`width=1000px,height=600px,location=no`);
		},

		getBreakpointsInFolder(folder: string): {line:number, prog:string}[] {
			//Filter breakpoints down to only those that have a folder as the IMMEDIATE parent
			return this.$store.state.breakpoints.filter(
				(b: {line:number, prog:string}) => path.resolve(b.prog, '..') === folder
			).map((b: {line:number, prog:string}) => {
				b.prog = path.basename(b.prog).split(/\./)[0]
				return b;
			});
		}
	},
	watch: {
		runConfigs(val: RunConfiguration[]) {
			if (val.length === 0)
				this.chosenRunConfig = undefined;
			else if (this.chosenRunConfig === undefined)
				this.chosenRunConfig = val[0];
		},
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

.v-navigation-drawer--mini-variant, .v-navigation-drawer {
	overflow: visible !important;
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
	min-height: 20%;
	max-height: 90%;
}
.top.full-height {
	max-height: 100%;
}

.bottom {
	/*Align to the bottom*/
	bottom: 0;
	min-height: 10%;
	max-height: 80%;
	/*Resize contents to make room for the divider*/
	display: flex;
	flex-direction: column;
}
.bottom.hidden {
	/*Align to the bottom*/
	bottom: 0;
	min-height: 0;
	height: 0;
	display: none;
}

.run-panel {
	flex: 1;
}
</style>