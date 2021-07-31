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
					style="border-right: 1px solid grey;"
					class="text-body-2 pa-0"
				>
					<div class="pa-0">
						<v-btn depressed @click="createConfig" >
							<FontAwesomeIcon icon="plus"/>
						</v-btn>
					</div>

					<v-list dense>
						<v-list-item-group v-model="configIndex">
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
					</v-card-title>

					<v-container>
						<v-row class="mt-0">
							<v-text-field
								v-model="nameModel"
								label="Configuration name*"
								class="mb-0 mt-0 pb-0 pt-0"
								required
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
							/>
						</v-row>

						<v-row class="">
							<v-text-field
								v-model="fileModel"
								label="File*"
								class="mb-0 mt-0 pb-0 pt-0"
								required
							/>
						</v-row>
						<v-row class="">
							<v-text-field
								v-model="inputModel"
								label="Input tree*"
								class="mb-0 mt-0 pb-0 pt-0"
								required
							/>
						</v-row>
						<v-row class="">
							<v-text-field
								v-model="formatModel"
								label="Tree Display Format*"
								class="mb-0 mt-0 pb-0 pt-0"
								required
							/>
						</v-row>
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
					@click="() => {saveConfig(); this.showDialog = false}"
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
			configIndex: 0,
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
		}
	},
	mounted() {
		this.currentOpenConfig = this.runConfigs[0] || undefined;
	},
	methods: {
		saveConfig() {
			//TODO: Feedback errors here
			if (!this.nameModel || !this.nameModel.replace(/\s+/, '')) {
				console.error(`invalid name: `, this.nameModel);
				return;
			}
			if (!this.formatModel || !this.formatModel.replace(/\s+/, '')) {
				console.error(`invalid outputFormat: `, this.formatModel);
				return;
			}
			if (!this.fileModel || !this.fileModel.replace(/\s+/, '')) {
				console.error(`invalid file: `, this.fileModel);
				return;
			}
			if (!this.inputModel || !this.inputModel.replace(/\s+/, '')) {
				console.error(`invalid input: `, this.inputModel);
				return;
			}
			if (this.interpreterModel === null || this.interpreterModel === undefined) {
				console.error(`invalid program: `, this.interpreterModel);
				return;
			}

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
			this.currentOpenConfig = undefined;
		},
	},
	watch: {
		runnerProg(prog: InterpreterType) {
			this.interpreterVal = prog.interpreter;
		},
		currentOpenConfig(config: RunConfiguration|undefined) {
			//TODO: This is a number when opening from the list
			console.log('open', this.currentOpenConfig)
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
		}
	},
});
</script>


<style scoped>
.actions-container {
	border-top: 1px solid grey;
}
</style>
