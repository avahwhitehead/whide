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
			<div class="full-height" style="display: flex; flex-direction: column">
				<div style="flex: 0">
					<v-btn @click="handleChangeRootClick">Change Root</v-btn>
				</div>
				<FilePicker :directory="cwd" :filter="filterFiles" @changeFile="openFile" style="flex: 1" />

				<v-divider />
				<v-checkbox v-model="filterFiles" title="Show only *.while files" style="flex: 0" label="While files only" />
			</div>
		</v-navigation-drawer>

		<v-main class="pa-0 fill-height overflow-hidden main-container">
			<CodeEditorElement
				class="top"
				ref="codeEditor"
				@change="onCodeEditorValueChange"
				:class="{'full-height': !showRunPanel}"
				:style="{'height': codeEditorHeight}"
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
				class="mt-0 pt-0 remove-messages"
				ref="pureWhileToggle"
				v-model="extendedWhile"
				:label="`${extendedWhile ? 'Extended' : 'Pure'} Parser`"
				:disabled="focusedFile === undefined"
				title="If enabled, extended WHILE syntax is allowed in the program code. Otherwise only pure WHILE syntax."
			/>

			<v-radio-group class="remove-messages mt-0" v-model="secondEditorContentModel" dense :disabled="!focusedFile" label="Tools:">
				<v-radio value="NOTHING" label="Nothing" />
				<v-radio value="PURE_WHILE" label="Show Pure WHILE" />
				<v-radio value="SHOW_PAD" label="Show Prog as Data" />

				<v-checkbox
						label="Live update"
						dense
						class="ma-0 pa-0"
						v-model="secondEditorLiveMode"
						:disabled="!focusedFile || secondEditorContentModel === 'NOTHING'"
				/>
			</v-radio-group>

			<v-btn
				absolute
				left
				shaped
				min-width="5px"
				width="5px"
				@click="showPopout = !showPopout"
				:style="{top: '0', transform:'translateX(-150%)', visibility: 'visible !important', 'z-index': 100}"
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
		<DeleteFilePopup
			v-model="showDeleteFilePopup"
			v-if="isNotElectron"
		/>

		<v-dialog v-model="progErrPopupVisible">
			<v-card style="white-space: pre; text-align: left;">
				<code v-text="progErrPopupContent" />
			</v-card>
		</v-dialog>
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
import { Menu } from "@/types";
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
import { displayPad, ProgramManager } from "whilejs";
import { HWHILE_DISPLAY_FORMAT, ProgDataType } from "whilejs/lib/tools/progAsData";
import { prog_to_pure_while } from "@/utils/program_converters";

const electron = (window['require'] !== undefined) ? require("electron") : undefined;

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	codeEditor? : CodeMirror.Editor;
	showChangeRootPopup: boolean;
	showDeleteFilePopup: boolean;
	showNewFilePopup: boolean;
	createFolder: boolean;
	showDownloadPopup: boolean;
	showPopout: boolean|undefined;
	fileViewerWidth: number;
	runPanelHeight: number;
	progErrPopupVisible: boolean;
	progErrPopupContent: string;
	filterFiles: boolean;
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
			showChangeRootPopup: false,
			showDeleteFilePopup: false,
			showNewFilePopup: false,
			createFolder: false,
			showDownloadPopup: false,
			showPopout: undefined,
			fileViewerWidth: 200,
			runPanelHeight: 200,
			progErrPopupVisible: false,
			progErrPopupContent: '',
			filterFiles: true,
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
				{
					name: "Tools",
					children: [
						{
							name: 'To Programs as Data',
							command: this.menu_to_pad_click,
						},
						{
							name: 'To Pure WHILE',
							command: this.menu_to_pure_click,
						},
					]
				},
				{
					name: "Help",
					children: [
						{
							name: 'About',
							command: this.menu_help_about_click,
						},
						{
							name: 'View on GitHub',
							command() {
								window.open('https://github.com/sonrad10/Whide/', 'about:blank');
							}
						},
						{
							name: 'Privacy Policy',
							command: this.menu_help_privacy_click,
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
		runners(): {name:string, runner:AbstractRunner}[] {
			return this.$store.state.programRunners;
		},
		editorController(): any {
			return this.$refs.codeEditor as (typeof CodeEditorElement);
		},
		secondEditorContentModel: {
			get(): 'NOTHING'|'PURE_WHILE'|'SHOW_PAD' {
				return this.focusedFile?.secondEditorDisplayMode || 'NOTHING';
			},
			set(val: 'NOTHING'|'PURE_WHILE'|'SHOW_PAD') {
				if (this.focusedFile){
					this.focusedFile.secondEditorDisplayMode = val;
				}
			},
		},
		secondEditorLiveMode: {
			get(): boolean {
				if (!this.focusedFile) return true;
				return this.focusedFile.secondEditorLiveMode;
			},
			set(val: boolean) {
				if (this.focusedFile){
					this.focusedFile.secondEditorLiveMode = val;
				}
			},
		}
	},
	destroyed() {
		//Remove global event listeners before destroying the element
		if (electron) {
			electron.ipcRenderer.off('file.new-file', this.menu_newFile_click);
			electron.ipcRenderer.off('file.new-folder', this.menu_newFolder_click);
			electron.ipcRenderer.off('file.save', this.menu_save_click);
			electron.ipcRenderer.off('file.delete', this.menu_delete_click);
			electron.ipcRenderer.off('file.delete.folder', this.menu_delete_folder_click);
			electron.ipcRenderer.off('file.settings', this.menu_settings_click);
			electron.ipcRenderer.off('about.help', this.menu_help_about_click);
			electron.ipcRenderer.off('about.privacy', this.menu_help_privacy_click);
			electron.ipcRenderer.off('tools.to-pad', this.menu_to_pad_click);
			electron.ipcRenderer.off('tools.to-pure', this.menu_to_pure_click);
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
			electron.ipcRenderer.on('file.delete.folder', this.menu_delete_folder_click);
			electron.ipcRenderer.on('file.settings', this.menu_settings_click);
			electron.ipcRenderer.on('about.help', this.menu_help_about_click);
			electron.ipcRenderer.on('about.privacy', this.menu_help_privacy_click);
			electron.ipcRenderer.on('tools.to-pad', this.menu_to_pad_click);
			electron.ipcRenderer.on('tools.to-pure', this.menu_to_pure_click);
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
			await this.editorController._openFile(filePath);
		},
		async runProgramClick() {
			if (!this.chosenRunConfig) throw new Error("No run configuration selected");

			let config = this.chosenRunConfig;
			let inputExpression = config.input;

			let runner: AbstractRunner;

			let folder = path.dirname(config.file);

			if (config.interpreter === INTERPRETERS.WHILE_JS) {
				//Create a While.js runner for the program
				runner = new WhileJsRunner({
					expression: inputExpression,
					file: config.file,
					directory: folder,
				});
			} else {
				//Create an HWhile runner for the program
				runner = new HWhileRunner({
					expression: inputExpression,
					file: config.file,
					directory: folder,
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
			let breakpoints: { line: number; prog: string }[];
			breakpoints = this.getBreakpointsInFolder(path.dirname(config.file));

			if (config.interpreter === INTERPRETERS.WHILE_JS) {
				throw new Error("Can't debug with While.js");
			} else {
				//Create an HWhile runner for the program
				runner = new HWhileDebugger({
					expression: inputExpression,
					file: config.file,
					directory: path.dirname(config.file),
					hwhile: this.$store.state.settings.general.hwhilePath || 'hwhile',
					showAllOutput: this.$store.state.settings.general.showAllHWhileOutput,
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
		async onFileCreate(filePath: string, isFolder: boolean) {
			if (isFolder) return;
			await this.editorController._openFile(filePath);
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
					this.editorController.saveAllFiles();
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
			this.editorController.saveAllFiles();
		},
		menu_delete_click() {
			if (electron) {
				let filePathPromise: Promise<OpenDialogReturnValue> = electron.remote.dialog.showOpenDialog(null, {
					defaultPath: this.cwd,
					buttonLabel: 'Delete',
					properties: ['openFile'],
				});
				filePathPromise.then((value: OpenDialogReturnValue) => {
					const filePath = value.filePaths[0];
					if (!filePath) return;
					try {
						fs.unlinkSync(filePath);
					} catch (e) {
						let err: Error = e as Error;
						electron.remote.dialog.showErrorBox(`${err.name}`, err.message);
					}
				});
			} else {
				this.showDeleteFilePopup = true;
			}
		},
		menu_delete_folder_click() {
			if (electron) {
				let filePathPromise: Promise<OpenDialogReturnValue> = electron.remote.dialog.showOpenDialog(null, {
					defaultPath: this.cwd,
					buttonLabel: 'Delete',
					properties: ['openDirectory'],
				});
				filePathPromise.then((value: OpenDialogReturnValue) => {
					const filePath = value.filePaths[0];
					if (!filePath) return;
					try {
						fs.rmdirSync(filePath);
					} catch (e) {
						let err: Error = e as Error;
						electron.remote.dialog.showErrorBox(`${err.name}`, err.message);
					}
				});
			} else {
				this.showDeleteFilePopup = true;
			}
		},
		menu_export_click() {
			this.showDownloadPopup = true;
		},
		menu_settings_click() {
			this.showSettingsPopup();
		},
		menu_help_about_click(): void {
			let routeData = this.$router.resolve({ path: '/about' });
			window.open(routeData.href, '_blank',`width=600px,height=500px,location=no`);
		},
		menu_help_privacy_click(): void {
			let routeData = this.$router.resolve({ path: '/privacy' });
			window.open(routeData.href, '_blank',`width=1000px,height=700px,location=no`);
		},

		async menu_to_pad_click(): Promise<void> {
			this.secondEditorContentModel = 'SHOW_PAD';

			if (!this.focusedFile) {
				alert("Open a program to convert it to Programs-as-Data form");
				return;
			}

			//Convert the program to pure WHILE ready for the PaD conversion
			const [progMgr, errs]: [ProgramManager|null,null|string[]] = await prog_to_pure_while(
				this.focusedFile.doc.getValue(),
				this.focusedFile.name,
				path.dirname(this.focusedFile.path)
			);
			if (errs) {
				this.focusedFile.secondEditorErrorList = errs;
				return;
			}
			this.focusedFile.secondEditorErrorList = [];

			//Display the result
			const pad: ProgDataType = progMgr!.toPad();
			this.focusedFile.secondEditorContent = displayPad(pad, HWHILE_DISPLAY_FORMAT);
		},

		async menu_to_pure_click(): Promise<void> {
			this.secondEditorContentModel = 'PURE_WHILE';

			//TODO: Better way to output problems here
			if (!this.focusedFile) {
				alert("Open a program to convert it to Programs-as-Data form");
				return;
			}

			//Convert the program to pure WHILE
			const [progMgr, errs]: [ProgramManager|null,null|string[]] = await prog_to_pure_while(
				this.focusedFile.doc.getValue(),
				this.focusedFile.name,
				path.dirname(this.focusedFile.path)
			);
			if (errs) {
				this.focusedFile.secondEditorErrorList = errs;
				return;
			}
			this.focusedFile.secondEditorErrorList = [];

			//Display the result
			this.focusedFile.secondEditorContent = progMgr!.displayProgram();
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
				(b: {line:number, prog:string}) => {
					return path.relative(folder, path.dirname(b.prog)) === '';
				}
			).map(({line, prog}: {line:number, prog:string}) => ({
				prog: path.basename(prog).split(/\./)[0],
				line: line,
			}));
		},

		onCodeEditorValueChange() {
			if (!this.focusedFile) return;

			const displayMode = this.focusedFile.secondEditorDisplayMode;
			if (displayMode !== 'NOTHING' && this.focusedFile.secondEditorLiveMode) {
				if (displayMode === 'SHOW_PAD') {
					this.menu_to_pad_click();
				} else if (displayMode === 'PURE_WHILE') {
					this.menu_to_pure_click();
				}
			}
		},
	},
	watch: {
		runConfigs(val: RunConfiguration[]) {
			if (val.length === 0)
				this.chosenRunConfig = undefined;
			else if (this.chosenRunConfig === undefined)
				this.chosenRunConfig = val[0];
		},
		secondEditorContentModel(secondEditorContentModel: string) {
			if (!this.focusedFile) return;

			if (secondEditorContentModel === 'NOTHING') {
				this.focusedFile.secondEditorContent = undefined;
			} else if (secondEditorContentModel === 'SHOW_PAD') {
				this.menu_to_pad_click();
			} else if (secondEditorContentModel === 'PURE_WHILE') {
				this.menu_to_pure_click();
			}
		},
		focusedFile(focusedFile: FileInfoState|undefined) {
			if (!focusedFile) {
				this.secondEditorContentModel = 'NOTHING';
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

.v-navigation-drawer--mini-variant, .v-navigation-drawer {
	overflow: visible !important;
}

.remove-messages .v-messages {
	display: none;
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