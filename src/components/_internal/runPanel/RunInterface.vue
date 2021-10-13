<template>
	<v-container fluid class="ma-0 pa-0 run-interface-container">
		<v-row class="ma-0 pa-0 fill-height">
			<v-navigation-drawer class="pa-0" style="width: unset;" permanent>
				<v-list dense>
					<v-list-item>
						<v-list-item-icon class="ma-0">
							<v-btn
								depressed
								block
								class="pa-0 ma-0"
								:disabled="!allowRun"
							>
								<FontAwesomeIcon icon="play" @click="onIconClick('play')"/>
							</v-btn>
						</v-list-item-icon>
					</v-list-item>

					<v-list-item>
						<v-list-item-icon class="ma-0">
							<v-btn
								depressed
								block
								class="pa-0 ma-0"
								:disabled="!allowStep"
							>
								<FontAwesomeIcon icon="step-forward" @click="onIconClick('step-forward')"/>
							</v-btn>
						</v-list-item-icon>
					</v-list-item>

					<v-list-item>
						<v-list-item-icon class="ma-0">
							<v-btn
								depressed
								block
								class="pa-0 ma-0"
								:disabled="!allowStop"
							>
								<FontAwesomeIcon icon="stop" @click="onIconClick('stop')"/>
							</v-btn>
						</v-list-item-icon>
					</v-list-item>
				</v-list>
			</v-navigation-drawer>

			<v-col class="ma-0 pa-0 fill-height overflow-y-auto">
				<OutputElement :value="outputText" class="code-output d-block" />
			</v-col>

			<v-col cols="4" class="ma-0 pa-0 pl-2 fill-height overflow-y-auto">
				<v-select
					v-model="selectedProgram"
					:items="programs"
					dense
					hide-details
				/>

				<VariableTable
					class="variable-viewer"
					:variables="variables"
					:showProgramCol="showTableProgramCol"
					@change="onVariableChange"
				/>
			</v-col>
		</v-row>
	</v-container>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { BinaryTree } from "@whide/tree-lang";
import { AbstractRunner, ProgramState } from "@/run/AbstractRunner";
import { RunPanelInstanceController } from "@/api/controllers/RunPanelController";
import OutputElement from "@/components/_internal/runPanel/OutputElement.vue";
import VariableTable, { VariableDisplayType } from "@/components/_internal/runPanel/VariableTable.vue";
import { stringifyTree } from "@/utils/tree_converters";

interface DataTypeDescriptor {
	selectedProgram: string|null;
}

export default Vue.extend({
	name: 'RunInterface',
	components: {
		OutputElement,
		VariableTable,
	},
	props: {
		instanceController: {
			type: Object as PropType<RunPanelInstanceController>,
			required: true,
		}
	},
	data(): DataTypeDescriptor {
		return {
			selectedProgram: null,
		};
	},
	computed: {
		variables() : VariableDisplayType[] {
			if (!this.instanceController) return [];
			let vars: Map<string, Map<string, BinaryTree>> = this.instanceController.variables;
			let res: VariableDisplayType[] = [];

			//Get the programs to display the variables for
			let programs: string[];
			//All the programs
			if (this.selectedProgram === null) programs = Array.from(vars.keys());
			//Only this one program
			else programs = [this.selectedProgram];

			//Iterate over the chosen program(s)
			for (let p of programs) {
				//Get all the variables in the program
				let progVars: Map<string, BinaryTree> = vars.get(p) || new Map();
				//Iterate over the variables in the program
				for (let v of progVars.keys()) {
					let tree: BinaryTree = progVars.get(v)!;
					let conversionString = 'any';
					let treeString = stringifyTree(tree, conversionString);

					res.push({
						program: p,
						name: v,
						value: treeString,
						type: conversionString,
						tree: tree,
					});
				}
			}
			return res;
		},
		outputText(): string {
			return this.instanceController.output;
		},
		programs(): string[] {
			//Get all the variables in the store
			//Type is a map of programs -> variables -> value
			let vars: Map<string, Map<string, BinaryTree>> = this.instanceController.variables;

			//List of all the programs
			let programs: any[] = [
				//Additional option to display all the variables at once
				{ text: 'all programs', value: null }
			];
			//Add each key of the variable map to the program list
			//Each key is the name of a program
			for (let prog of vars.keys()) {
				programs.push({text: prog, value: prog});
			}
			//Return the list
			return programs;
		},
		showTableProgramCol(): boolean {
			//Only show program names if there is more than 1 program being displayed
			return this.selectedProgram === null;
		},

		allowRun(): boolean {
			return this.instanceController
				&& this.instanceController.runner.allowRun;
		},
		allowStep(): boolean {
			return this.instanceController
				&& this.instanceController.runner.allowStep;
		},
		allowStop(): boolean {
			return this.instanceController
				&& !this.instanceController.runner.isStopped;
		},
	},
	methods: {
		async onIconClick(icon: string): Promise<void> {
			if (!this.instanceController) {
				throw new Error('No run instance controller provided');
			}
			if (this.instanceController.isStopped) {
				throw new Error('Run instance has stopped');
			}

			const runner : AbstractRunner = this.instanceController.runner;

			//Perform the command and read the resulting program state
			let newState: ProgramState|undefined;
			if (icon === 'play') {
				newState = await runner.run() || undefined;
			} else if (icon === 'step-forward') {
				if (runner.step) {
					newState = await runner.step() || undefined;
				}
			} else if (icon === 'stop') {
				runner.stop();
			}

			if (newState !== undefined) {
				//Update the variable store
				if (newState.variables !== undefined) {
					this.instanceController!.variables = newState.variables;
				}
			}
		},
		
		onVariableChange(name: string, tree: BinaryTree, conversionString: string): void {
			let v: VariableDisplayType|undefined = this.variables.find(e => e.name === name);
			if (v === undefined) return;

			v.type = conversionString;
			v.value = stringifyTree(tree, conversionString);

			if (this.instanceController.runner.set)
				this.instanceController.runner.set(name, tree);
		}
	},
})
</script>


<style scoped>
.run-interface-container {
	height: 100%;
}

.code-output {
	overflow-y: auto;
	text-align: left;
}
</style>
