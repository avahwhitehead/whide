<template>
	<div class="pa-0 ma-0 fill-page">
		<v-navigation-drawer permanent app class="nav-drawer" width="180px" v-model="showSelectPanel">
			<div class="pa-0">
				<v-btn depressed @click="createConfig" title="Create new run configuration" >
					<FontAwesomeIcon icon="plus"/>
				</v-btn>
			</div>

			<v-list dense>
				<v-list-item-group v-model="configIndex" mandatory>
					<v-list-item v-for="(config, i) in runConfigs" :key="i">
						<v-list-item-content>
							<v-list-item-title v-text="config.name" />
						</v-list-item-content>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-navigation-drawer>

		<div style="width: 100%; max-width: 100%;">
			<div class="actions-container">
				<v-btn
					color="blue darken-1"
					text
					@click="deleteConfig"
					v-text="'Delete'"
					:disabled="disableForm"
				/>

				<v-spacer />

				<span class="text-h5">Edit Run Configuration</span>

				<v-spacer />

				<v-btn
					color="blue darken-1"
					text
					@click="saveConfig()"
					v-text="'save'"
					:disabled="!isFormValid"
				/>
			</div>

			<div class="pa-5">
				<v-form ref="form" v-model="isFormValid">
					<v-row class="mt-0">
						<v-text-field
							v-model="nameModel"
							label="Configuration name*"
							class="mb-0 mt-0 pb-0 pt-0"
							required
							:rules="nameInputRules"
							:disabled="disableForm"
						/>
					</v-row>

					<v-row>
						<v-select
							v-model="interpreterModel"
							:items="interpreterList"
							label="WHILE Interpreter"
							class="dropdown"
							item-text="name"
							return-object
							outlined
							dense
							required
							:rules="interpreterInputRules"
							:disabled="disableForm"
						/>
						<v-tooltip bottom content-class="help-tooltip">
							<template v-slot:activator="{ on, attrs }">
								<v-btn
									depressed
									icon
									v-bind="attrs"
									v-on="on"
								>
									<v-icon>fa-question</v-icon>
								</v-btn>
							</template>
							<div>
								<div>HWhile is the primary While interpreter, but requires that it has been installed.</div>
								<div>While.js was built for compatability with Whide. It is newer and does not currently support debugging.</div>
								<div>Both interpreters should produce the same results.</div>
							</div>
						</v-tooltip>
					</v-row>

					<v-row>
						<v-text-field
							v-model="fileModel"
							label="Program*"
							class="mb-0 mt-0 pb-0 pt-0"
							required
							:rules="fileInputRules"
							:disabled="disableForm"
						/>
						<v-btn
							depressed
							class="off-black"
							title="Choose program"
							@click="showFilePicker = true"
						>
							<v-icon>fa-folder</v-icon>
						</v-btn>
					</v-row>

					<v-row>
						<v-text-field
							v-model="inputModel"
							label="Input tree*"
							class="mb-0 mt-0 pb-0 pt-0"
							required
							:rules="treeInputRules"
							:disabled="disableForm"
						/>
						<v-btn
							depressed
							class="off-black"
							@click="showTreeGraph = !showTreeGraph"
							:title="`${showTreeGraph?'Hide':'Show'} graphical viewer`"
						>
							<v-icon v-if="showTreeGraph">fa-eye-slash</v-icon>
							<v-icon v-else>fa-eye</v-icon>
						</v-btn>
					</v-row>
					<v-row>
						<transition name="fade">
							<v-col style="height: 30em; width: 20em;" v-if="showTreeGraph">
								<VariableTreeViewer :tree="displayableConvertedTree" />
							</v-col>
						</transition>
					</v-row>
				</v-form>

				<small>*indicates required field</small>
			</div>

			<FilePickerPopup
				v-model="showFilePicker"
				@change="onPathSelect"
				v-if="!$store.state.isElectron"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { INTERPRETERS, RunConfiguration } from "@/types/RunConfiguration";
import { FileInfoState } from "@/types/FileInfoState";
import path from "path";
import VariableTreeViewer, { TreeType } from "@/components/VariableTreeViewer.vue";
import FilePickerPopup from "@/components/FilePickerPopup.vue";
import { binaryTreeToDisplayable } from "@/utils/tree_converters";
import { fs } from "@/files/fs";
import { BinaryTree } from "whilejs";
import { treeParser as parseTree } from "@whide/tree-lang";
import { OpenDialogReturnValue } from "electron";

const electron = (window['require'] !== undefined) ? require("electron") : undefined;

type InterpreterType = {
	name: string,
	interpreter: INTERPRETERS
};

type DataTypeInterface = {
	configIndex: number,
	runnerProg: InterpreterType,
	interpreterList: InterpreterType[],

	nameModel: string,
	formatModel: string,
	fileModel: string,
	inputModel: string,
	interpreterVal: INTERPRETERS,

	isFormValid: boolean,

	showTreeGraph: boolean,
	treeErrorMessage: string|undefined,
	displayableConvertedTree: TreeType,

	showFilePicker: boolean,
	filePickerModel: string,
};

export default Vue.extend({
	name: 'RunConfigWindow',
	components: {
		FilePickerPopup,
		VariableTreeViewer,
	},
	data() : DataTypeInterface {
		return {
			configIndex: -1,
			runnerProg: { name:'While.js', interpreter:INTERPRETERS.WHILE_JS },
			interpreterList: [
				...(electron ? [{ name:'HWhile', interpreter:INTERPRETERS.HWHILE }] : []),
				{ name:'While.js', interpreter:INTERPRETERS.WHILE_JS },
			],
			nameModel: '',
			formatModel: '',
			fileModel: '',
			inputModel: 'nil',
			interpreterVal: INTERPRETERS.WHILE_JS,
			isFormValid: true,
			showTreeGraph: false,

			treeErrorMessage: undefined,
			displayableConvertedTree: binaryTreeToDisplayable(null),

			showFilePicker: false,
			filePickerModel: '',
		}
	},
	mounted() {
		this.showSelectPanel = true;
		if (this.runConfigs.length === 0) this.createConfig();
	},
	computed: {
		runConfigs(): RunConfiguration[] {
			const state = this.$store.state;
			return state.runConfigurations.map((c: string) => state.runConfigLookup[c]);
		},
		//Force the select panel to always be visible
		showSelectPanel: {
			get(): boolean { return true; },
			set() { /*Do nothing*/ }
		},
		interpreterModel: {
			get(): InterpreterType {
				return this.interpreterList.find((p: any) => p.interpreter === this.interpreterVal)!;
			},
			set(val: InterpreterType): void {
				this.interpreterVal = val.interpreter;
			}
		},
		currentOpenConfig: {
			get(): RunConfiguration|undefined {
				return this.runConfigs[this.configIndex];
			},
			set(val: RunConfiguration|undefined): void {
				if (val === undefined) this.configIndex = -1;
				else this.configIndex = this.runConfigs.indexOf(val);
			}
		},
		nameInputRules(): ((v: string) => boolean|string)[] {
			return [
				this.rule_requireNonEmpty,
				(v: string) => {
					if (this.runConfigs.find((c: RunConfiguration) => c !== this.currentOpenConfig && c.name === v) === undefined)
						return true;
					return "That name already exists";
				}
			];
		},
		interpreterInputRules(): ((v: string) => boolean|string)[] {
			return [];
		},
		fileInputRules(): ((v: string) => boolean|string)[] {
			return [
				this.rule_requireNonEmpty,
				(v: string) => fs.existsSync(v) || "File must exist"
			];
		},
		treeInputRules(): ((v: string) => boolean|string)[] {
			return [
				this.rule_requireNonEmpty,
				() => {
					return this.treeErrorMessage || true
				}
			];
		},
		treeFormatInputRules(): ((v: string) => boolean|string)[] {
			return [
				this.rule_requireNonEmpty,
			];
		},
		disableForm(): boolean {
			return this.runConfigs.length === 0;
		},

		openFiles(): FileInfoState[] {
			const state = this.$store.state;
			return state.openFiles.map((o: string) => state.fileLookup[o]);
		},

		focusedFile(): string|undefined {
			return this.$store.state.focusedFile;
		},
	},
	methods: {
		createConfig() {
			let newConfig: RunConfiguration = {
				name: this.focusedFile ? path.basename(this.focusedFile) : 'Unnamed',
				file: this.focusedFile ? this.focusedFile : '',
				input: 'nil',
				outputFormat: 'any',
				interpreter: INTERPRETERS.HWHILE,
			}
			this.$store.commit('addRunConfig', newConfig);
			this.configIndex = this.runConfigs.indexOf(newConfig);
		},
		saveConfig() {
			let newConfig: RunConfiguration = {
				file: this.fileModel,
				input: this.inputModel,
				interpreter: this.interpreterVal,
				name: this.nameModel,
				outputFormat: this.formatModel,
			};
			if (!this.currentOpenConfig) {
				this.$store.commit('addRunConfig', newConfig);
			} else {
				this.$store.commit('removeRunConfig', this.currentOpenConfig.name);
				this.$store.commit('addRunConfig', newConfig);
			}
			this.$store.commit('setChosenRunConfig', newConfig.name);
		},

		deleteConfig() {
			if (!this.currentOpenConfig) return;
			this.$store.commit('removeRunConfig', this.currentOpenConfig.name);
		},

		rule_requireNonEmpty(val: string): boolean|string {
			return val.replaceAll(/\s+/g, '') !== '' || "Enter a value";
		},

		onPathSelect(p: string): void {
			this.fileModel = p;
		},
	},
	watch: {
		runnerProg(prog: InterpreterType) {
			this.interpreterVal = prog.interpreter;
		},
		currentOpenConfig(config: RunConfiguration|undefined) {
			if (config === undefined) {
				this.nameModel = '';
				this.interpreterVal = this.interpreterList[0].interpreter;
				this.fileModel = '';
				this.inputModel = '';
				this.formatModel = '';
			} else {
				this.nameModel = config.name;
				this.interpreterVal = config.interpreter;
				this.fileModel = config.file;
				this.inputModel = config.input;
				this.formatModel = config.outputFormat;
			}
		},
		runConfigs: {
			deep: true,
			handler() {
				//Automatically refresh the form validations if the run configurations list updates
				(this.$refs.form! as Vue & { validate: () => void }).validate();
			}
		},
		inputModel(treeString: string) {
			//Convert the tree string to a BinaryTree object
			let parsed_tree: BinaryTree;
			try {
				parsed_tree = parseTree(treeString);
			} catch (e) {
				this.treeErrorMessage = (e as Error).message;
				return;
			}

			//Attempt to convert the tree to a displayable representation
			let displayable: TreeType|string = binaryTreeToDisplayable(parsed_tree, treeString);
			if (typeof displayable === 'string') {
				//Display the error message
				//And keep the same tree display from before
				this.treeErrorMessage = displayable;
			} else {
				//Clear any error messages
				this.treeErrorMessage = undefined;
				//Display the tree
				this.displayableConvertedTree = displayable;
			}
		},

		showFilePicker(showFilePicker: boolean): void {
			if (showFilePicker && electron) {
				electron.remote.dialog.showOpenDialog({
					filters: [
						{ name: 'WHILE files', extensions: ['while'] },
						{ name: 'All files', extensions: ['*'] },
					],
					properties: [],
				}).then((result: OpenDialogReturnValue) => {
					this.onPathSelect(result.filePaths[0]);
				})
			}
		},
	},
});
</script>

<style scoped>
.fill-page {
	width: 100%;
	height: 100%;
}

.actions-container {
	border-bottom: 1px solid grey;
	position: sticky;
	top: 0;
	z-index: 10;
	width: 100%;
	display: flex;
}

.help-tooltip {
	opacity: 1!important;
}

.expand-button {
	text-decoration: underline;
	color: blue;
}

.icon-delete {
	cursor: pointer;
}

.off-black {
	color: #333 !important;
}

.nav-drawer {
	/*
	Fix for collapsing side panel
	Source: https://github.com/vuetifyjs/vuetify/issues/5617#issuecomment-845067001
	*/
	transform: translateX(0) !important;
	visibility: visible !important;
}

.fade-enter-active, .fade-leave-active {
	transition: all .2s cubic-bezier(0, 0, 0, 0);
}
.fade-enter, .fade-leave-to {
	transform: scaleY(0) translateZ(0);
	height: 0;
}
</style>
