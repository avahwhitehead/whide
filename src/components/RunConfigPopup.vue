<template>
	<v-dialog
		v-model="showDialog"
		persistent
		max-width="800px"
	>
		<v-card class="ma-0 pa-0 pt-2">
			<v-row class="ma-0">
				<v-col
					cols="2"
					class="sidebar text-body-2 pa-0"
				>
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
				</v-col>

				<v-col>
					<v-card-title class="pa-0">
						<span class="text-h5">Run Configuration</span>
						<v-spacer />
						<FontAwesomeIcon
							icon="trash"
							title="Delete"
							@click="deleteConfig()"
							class="icon-delete"
						/>
					</v-card-title>

					<v-container>
						<v-form ref="form">
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
							<v-row class="">
								<v-text-field
									v-model="formatModel"
									label="Tree Display Format*"
									class="mb-0 mt-0 pb-0 pt-0"
									required
									:rules="treeFormatInputRules"
								/>
							</v-row>
						</v-form>
					</v-container>

					<small>*indicates required field</small>
				</v-col>
			</v-row>

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
				/>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import { INTERPRETERS, RunConfiguration } from "@/types/RunConfiguration";

type InterpreterType = {
	name: string,
	interpreter: INTERPRETERS
};

interface DataTypeInterface {
	runnerProg: InterpreterType,
	interpreterList: InterpreterType[],

	nameModel: string,
	formatModel: string,
	fileModel: string,
	inputModel: string,
	interpreterVal: INTERPRETERS,

	configIndex: number,
}

export default Vue.extend({
	name: 'RunConfigPopup',
	components: {

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
			inputModel: '',
			interpreterVal: INTERPRETERS.WHILE_JS,
			configIndex: -1,
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
			];
		},
		treeInputRules(): ((v: string) => boolean|string)[] {
			return [
				this.rule_requireNonEmpty,
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
		}
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
		}
	},
});
</script>


<style scoped>
.actions-container {
	border-top: 1px solid grey;
}

.sidebar {
	border-right: 1px solid grey;
}

.icon-delete {
	cursor: pointer;
}
</style>
