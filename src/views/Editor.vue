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
				</v-row>
			</v-col>
		</v-app-bar>

		<v-navigation-drawer app permanent clipped :width="fileViewerWidth" ref="filePanel">
			<v-btn @click="handleChangeRootClick">Change Root</v-btn>
			<FilePicker :directory="cwd" @changeFile="openFile" />
		</v-navigation-drawer>

		<v-main class="pa-0 fill-height overflow-hidden main-container">
			<CodeEditorElement
				class="top"
				:style="{'height': 'calc(100% - ' + runPanelHeight + 'px)'}"
				v-model="focused_file"
				:allow-extended="extendedWhile"
				@controller="onEditorControllerChange"
			/>

			<div class="bottom" ref="runPanel" :style="{'height': runPanelHeight + 'px'}">
				<v-divider />
				<run-panel class="run-panel" :runners="runners" />
			</div>
		</v-main>

		<v-navigation-drawer app right clipped v-model="showPopout">
			<v-btn right @click="showSettingsPopup = !showSettingsPopup">Global Settings</v-btn>

			<div class="title pt-2 pb-0">Options</div>
			<v-switch class="mt-0" ref="pureWhileToggle" v-model="extendedWhile" :label="`${extendedWhile ? 'Extended' : 'Pure'} WHILE`" />

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

		<v-dialog
			v-model="showHWhileNotFoundError"
			width="400px"
		>
			<v-card>
				<v-card-title>Could not find HWhile</v-card-title>
				<v-card-text>
					Please ensure HWhile is installed on your computer and available on the global path,
					or set the path to the HWhile executable in settings.
				</v-card-text>
				<v-card-actions>
					<v-spacer />

					<v-btn
						color="blue darken-1"
						text
						@click="showHWhileNotFoundError = false"
						v-text="'Ok'"
					/>
				</v-card-actions>
			</v-card>
		</v-dialog>

		<DownloadFilePopup v-model="showDownloadPopup" />
		<RunConfigPopup v-model="showRunConfigPopup" />
		<SettingsPopup v-model="showSettingsPopup" />
		<ChangeRootPopup v-model="showChangeRootPopup" />
		<NewFilePopup
			v-model="showNewFilePopup"
			:create-folder="createFolder"
			@created="onFileCreate"
		/>
		<DeleteFilePopup v-model="showDeleteFilePopup" />
	</div>
</template>


<script lang="ts">
import Vue from "vue";
//Components
import CodeEditorElement, { FileInfoState } from "@/components/CodeEditorElement.vue";
import FilePicker from "@/components/FilePicker.vue";
import MenuBar from "@/components/MenuBar.vue";
import RunPanel from "@/components/RunPanel.vue";
import DownloadFilePopup from "@/components/DownloadFilePopup.vue";
import RunConfigPopup from "@/components/RunConfigPopup.vue";
import SettingsPopup from "@/components/SettingsPopup.vue";
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

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	focused_file? : string;
	codeEditor? : CodeMirror.Editor;
	editorController?: EditorController;
	ioController? : IOController;
	runners: {name:string, runner:AbstractRunner}[],
	extendedWhile: boolean;
	showRunConfigPopup: boolean;
	showSettingsPopup: boolean;
	showChangeRootPopup: boolean;
	showDeleteFilePopup: boolean;
	showNewFilePopup: boolean;
	createFolder: boolean;
	showHWhileNotFoundError: boolean;
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
		SettingsPopup,
		RunConfigPopup,
		FilePicker,
		CodeEditorElement,
		MenuBar,
		RunPanel,
		NewFilePopup,
	},
	data() : DataTypesDescriptor {
		return {
			focused_file: undefined,
			editorController: undefined,
			ioController: undefined,
			runners: [],
			extendedWhile: true,
			showRunConfigPopup: false,
			showSettingsPopup: false,
			showChangeRootPopup: false,
			showDeleteFilePopup: false,
			showNewFilePopup: false,
			createFolder: false,
			showHWhileNotFoundError: false,
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
		allowDebugging(): boolean {
			return !!this.chosenRunConfig && this.chosenRunConfig.interpreter !== INTERPRETERS.WHILE_JS;
		},
		allowRunning(): boolean {
			return !!this.chosenRunConfig;
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
									command: () => {
										this.createFolder = false;
										this.showNewFilePopup = true;
									}
								},
								{
									name: "New Folder",
									command: () => {
										this.createFolder = true;
										this.showNewFilePopup = true;
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
							command: () => {
								this.showDeleteFilePopup = true;
							}
						},
						{
							name: "Export",
							command: () => {
								this.showDownloadPopup = true;
							}
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
		}
	},
	mounted() {
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
			let breakpoints: number[] = runFileState ? runFileState.breakpoints : [];
			//Convert the breakpoints from 0-indexing to 1-indexing
			breakpoints = breakpoints.map(l => ++l);

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
				this.showHWhileNotFoundError = true;
			} else {
				console.error(err)
			}
		},

		onFileCreate(filePath: string, isFolder: boolean) {
			if (this.editorController && !isFolder) {
				this.editorController.open(filePath);
			}
		},

		openRunConfigPopup() {
			this.showRunConfigPopup = true;
		},

		onEditorControllerChange(editorController : EditorController) : void {
			this.editorController = editorController;
		},
		dirChange(dir: string) {
			//Change the working directory
			this.cwd = dir;
		},
		handleChangeRootClick() {
			this.showChangeRootPopup = true;
		},
		toggleTheme() {
			this.isDarkTheme = !this.isDarkTheme;
		}
	},
	watch: {
		runConfigs(val: RunConfiguration[]) {
			if (val.length > 0)
				this.$store.state.chosenRunConfig = val[0];
			else
				this.$store.state.chosenRunConfig = undefined;
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

.bottom {
	/*Align to the bottom*/
	bottom: 0;
	min-height: 10%;
	max-height: 80%;
	/*Resize contents to make room for the divider*/
	display: flex;
	flex-direction: column;
}

.run-panel {
	flex: 1;
}
</style>