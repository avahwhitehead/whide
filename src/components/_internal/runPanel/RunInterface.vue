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

			<v-col
				cols="4"
				class="ma-0 pa-0 pl-2 fill-height overflow-y-auto"
				v-if="runner.variables"
			>
				<v-select
					v-model="selectedProgram"
					:items="selectPrograms"
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
import { AbstractRunner } from "@/run/AbstractRunner";
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
		runner: {
			type: Object as PropType<AbstractRunner>,
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
			if (!this.runner.variables) return [];
			let vars: Map<string, Map<string, BinaryTree>> = this.runner.variables;
			let res: VariableDisplayType[] = [];

			//Get the programs to display the variables for
			let programs: string[];
			//All the programs
			if (this.selectedProgram === null) programs = this.programNames;
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
			return this.runner.output;
		},
		programNames(): string[] {
			//Get all the variables in the store
			if (!this.runner.variables) return [];
			//Return the list
			return Array.from(this.runner.variables.keys());
		},
		programs(): { text:string, value:string }[] {
			//Get all the variables in the store
			if (!this.runner.variables) return [];
			//Return the list
			return this.programNames.map(v => ({text:v, value:v}));
		},
		selectPrograms(): { text:string, value:string|null }[] {
			return [
				//Additional option to display all the variables at once
				{ text: 'all programs', value: null },
				//All the program names
				...this.programs
			];
		},
		showTableProgramCol(): boolean {
			//Only show program names if there is more than 1 program being displayed
			return this.selectedProgram === null;
		},

		allowRun(): boolean {
			return this.runner.allowRun;
		},
		allowStep(): boolean {
			return this.runner.allowStep;
		},
		allowStop(): boolean {
			return !this.runner.isStopped;
		},
	},
	methods: {
		async onIconClick(icon: string): Promise<void> {
			if (!this.runner) throw new Error('No runner provided');
			if (this.runner.isStopped) throw new Error('Run instance has stopped');

			//Perform the command and read the resulting program state
			if (icon === 'play') {
				await this.runner.run();
			} else if (icon === 'step-forward') {
				if (this.runner.step) await this.runner.step();
			} else if (icon === 'stop') {
				this.runner.stop();
			}
		},
		
		async onVariableChange(name: string, tree: BinaryTree, conversionString: string): Promise<void> {
			let v: VariableDisplayType|undefined = this.variables.find(e => e.name === name);
			if (v === undefined) return;

			//Assign the new variable value
			if (this.runner.set) {
				await this.runner.set(name, tree);

				v.type = conversionString;
				v.value = stringifyTree(tree, conversionString);
			}
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
