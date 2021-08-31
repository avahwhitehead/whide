<template>
	<v-dialog
		v-model="showDialog"
		persistent
		max-width="900px"
		scrollable
	>
		<v-card max-height="800px">
			<v-navigation-drawer permanent absolute width="180px">
				<div class="pa-0">
					<v-btn depressed @click="createConfig" >
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

			<v-card-title class="pt-0 pb-0" style="padding-left: 190px;">
				<span class="text-h5">Edit Run Configuration</span>
				<v-spacer />
				<FontAwesomeIcon
					icon="trash"
					title="Delete configuration"
					@click="deleteConfig()"
					class="icon-delete"
				/>
			</v-card-title>

			<v-container style="overflow-y: auto; padding-left: 200px;">
				<v-form ref="form" v-model="isFormValid">
					<v-row class="mt-0">
						<v-text-field
							v-model="nameModel"
							label="Configuration name*"
							class="mb-0 mt-0 pb-0 pt-0"
							required
							:rules="nameInputRules"
						/>
					</v-row>

					<v-row class="">
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
						/>
					</v-row>

					<v-row class="">
						<v-text-field
							v-model="fileModel"
							label="File*"
							class="mb-0 mt-0 pb-0 pt-0"
							required
							:rules="fileInputRules"
						/>
						<v-btn
							depressed
							title="Choose file"
							@click="showFilePicker = true"
						>
							<v-icon>far fa-folder</v-icon>
						</v-btn>
					</v-row>
					<v-row class="">
						<v-text-field
							v-model="inputModel"
							label="Input tree*"
							class="mb-0 mt-0 pb-0 pt-0"
							required
							:rules="treeInputRules"
						/>
					</v-row>
					<v-row>
						<div
							class="expand-button"
							@click="showTreeGraph = !showTreeGraph"
							v-text="`(${showTreeGraph ? 'hide' : 'show'} tree viewer)`"
						/>
					</v-row>
					<v-row>
						<transition name="fade">
							<v-col style="height: 30em; width: 20em;" v-if="showTreeGraph">
								<VariableTreeViewer :tree="displayableConvertedTree" />
							</v-col>
						</transition>
					</v-row>
<!--					<v-row class="">-->
<!--						<v-text-field-->
<!--							v-model="formatModel"-->
<!--							label="Tree Display Format*"-->
<!--							class="mb-0 mt-0 pb-0 pt-0"-->
<!--							required-->
<!--							:rules="treeFormatInputRules"-->
<!--						/>-->
<!--					</v-row>-->
					</v-form>

					<small>*indicates required field</small>
			</v-container>

			<v-card-actions class="actions-container">
				<v-spacer />

				<v-btn
					color="blue darken-1"
					text
					@click="showDialog = false"
					v-text="'close'"
				/>

				<v-btn
					color="blue darken-1"
					text
					@click="saveConfig()"
					v-text="'save'"
					:disabled="!isFormValid"
				/>
			</v-card-actions>
		</v-card>

		<FilePickerPopup v-model="showFilePicker" @change="onPathSelect" />
	</v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { INTERPRETERS, RunConfiguration } from "@/types/RunConfiguration";
import VariableTreeViewer, { TreeType } from "@/components/VariableTreeViewer.vue";
import { binaryTreeToDisplayable } from "@/utils/tree_converters";
import { treeParser as parseTree } from "@whide/tree-lang";
import { BinaryTree } from "whilejs";
import { fs } from "@/files/fs";
import FilePickerPopup from "@/components/FilePickerPopup.vue";

type InterpreterType = {
	name: string,
	interpreter: INTERPRETERS
};

type DataTypeInterface = {
	runnerProg: InterpreterType,
	interpreterList: InterpreterType[],

	nameModel: string,
	formatModel: string,
	fileModel: string,
	inputModel: string,
	interpreterVal: INTERPRETERS,

	isFormValid: boolean,

	configIndex: number,

	showTreeGraph: boolean,
	treeErrorMessage: string|undefined,
	displayableConvertedTree: TreeType,

	showFilePicker: boolean,
	filePickerModel: string,
};

export default Vue.extend({
	name: 'RunConfigPopup',
	components: {
		FilePickerPopup,
		VariableTreeViewer,
	},
	props: {
		value: Boolean,
	},
	data() : DataTypeInterface {
		return {
			runnerProg: { name:'While.js', interpreter:INTERPRETERS.WHILE_JS },
			interpreterList: [
				{ name:'HWhile (desktop app only)', interpreter:INTERPRETERS.HWHILE },
				{ name:'While.js', interpreter:INTERPRETERS.WHILE_JS },
			],
			nameModel: '',
			formatModel: '',
			fileModel: '',
			inputModel: 'nil',
			interpreterVal: INTERPRETERS.WHILE_JS,
			configIndex: -1,
			isFormValid: true,
			showTreeGraph: true,

			treeErrorMessage: undefined,
			displayableConvertedTree: binaryTreeToDisplayable(null),

			showFilePicker: false,
			filePickerModel: '',
		}
	},
	computed: {
		showDialog: {
			get(): boolean {
				return this.value;
			},
			set(value: boolean): void {
				this.$emit('input', value);
			}
		},
		runConfigs(): RunConfiguration[] {
			return this.$store.state.runConfigurations;
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
	},
	mounted() {
		this.currentOpenConfig = this.runConfigs[0] || undefined;
	},
	methods: {
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
				return;
			}

			this.$store.commit('overwriteRunConfig', [this.currentOpenConfig, newConfig]);
		},
		createConfig() {
			let newConfig: RunConfiguration = {
				name: 'Unnamed',
				file: '',
				input: 'nil',
				outputFormat: 'any',
				interpreter: INTERPRETERS.HWHILE,
			}
			this.$store.commit('addRunConfig', newConfig);
			this.configIndex = this.runConfigs.indexOf(newConfig);
		},
		deleteConfig() {
			this.$store.commit('removeRunConfig', this.currentOpenConfig);
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
		showDialog(val: boolean) {
			//Load the first run configuration on open
			if (val) this.configIndex = 0;
			//Clear the values on close
			else this.configIndex = -1;
		},
		currentOpenConfig(config: RunConfiguration|undefined) {
			if (config === undefined) {
				this.nameModel = 'Unnamed';
				this.interpreterVal = INTERPRETERS.WHILE_JS;
				this.fileModel = '';
				this.inputModel = 'nil';
				this.formatModel = 'any';
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
	},
});
</script>


<style scoped>
.actions-container {
	border-top: 1px solid grey;
}

.expand-button {
	text-decoration: underline;
	color: blue;
}

.icon-delete {
	cursor: pointer;
}

.fade-enter-active, .fade-leave-active {
	transition: all .2s cubic-bezier(0, 0, 0, 0);
}
.fade-enter, .fade-leave-to {
	transform: scaleY(0) translateZ(0);
	height: 0;
}
</style>
