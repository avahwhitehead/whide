<template>
	<v-container class="ma-0 pa-0 run-interface-container">
		<v-list dense>
			<v-list-item v-for="(name, i) in ['play', 'step-forward', 'stop']" :key="i">
				<v-list-item-icon class="ma-0">
					<v-btn depressed block class="pa-0 ma-0">
						<FontAwesomeIcon :icon="name" @click="onIconClick(name)"/>
					</v-btn>
				</v-list-item-icon>
			</v-list-item>
		</v-list>

		<OutputElement :value="outputText" class="code-output"/>

		<VariableTable
			class="variable-viewer"
			:variables="variables"
			@change="onVariableChange"
		/>
	</v-container>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { BinaryTree } from "@whide/tree-lang";
import { DebuggerControllerInterface } from "@/types";
import { ProgramState } from "@/run/AbstractRunner";
import { RunPanelInstanceController } from "@/api/controllers/RunPanelController";
import OutputElement from "@/components/_internal/runPanel/OutputElement.vue";
import VariableTable, { VariableDisplayType } from "@/components/_internal/runPanel/VariableTable.vue";
import { CustomDict } from "@/types/CustomDict";
import { stringifyTree } from "@/utils/tree_converters";

interface DataTypeDescriptor {

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

		};
	},
	computed: {
		variables() : VariableDisplayType[] {
			if (!this.instanceController) return [];
			let vars: CustomDict<BinaryTree> = this.instanceController.variables;
			let res: VariableDisplayType[] = [];
			for (let v of Object.keys(vars)) {
				let tree: BinaryTree = vars[v];
				let conversionString = 'any';
				let treeString = stringifyTree(tree, conversionString);

				res.push({
					name: v,
					value: treeString,
					type: conversionString,
					tree: tree,
				});
			}
			return res;
		},
		outputText(): string {
			return this.instanceController.output;
		},
	},
	methods: {
		async onIconClick(icon: string): Promise<void> {
			const debuggerCallbackHandler : DebuggerControllerInterface = this.instanceController?.debuggerCallbackHandler!;
			// if (!debuggerCallbackHandler) {
			// 	this.ioController?.prompt({
			// 		title: 'No files running',
			// 		message: 'Start debugging a program to use these controls',
			// 		options: ['Ok']
			// 	});
			// 	return;
			// }

			//Perform the command and read the resulting program state
			let newState: ProgramState|undefined;
			if (icon === 'play') newState = await debuggerCallbackHandler.run();
			else if (icon === 'step-forward') newState = await debuggerCallbackHandler.step();
			else if (icon === 'stop') debuggerCallbackHandler.stop();

			if (newState !== undefined) {
				//Update the variable store
				if (newState.variables !== undefined) {
					this.instanceController!.setVariablesFromMap(newState.variables);
				}
			}
		},
		
		onVariableChange(name: string, tree: BinaryTree, conversionString: string): void {
			let v: VariableDisplayType|undefined = this.variables.find(e => e.name === name);
			if (v === undefined) return;

			v.type = conversionString;
			v.value = stringifyTree(tree, conversionString);
		}
	},
	mounted() {

	},
})
</script>


<style scoped>
.run-interface-container {
	display: flex;
	flex-direction: row;
	height: 100%;
}

.code-output {
	flex: 1;
	overflow-y: auto;
	text-align: left;
}

.variable-viewer {
	flex: 0;
}
</style>
