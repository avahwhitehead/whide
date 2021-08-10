<template>
	<v-row class="mt-2 ml-1 mr-1" style="display: flex; flex-direction: row">
		<v-list dense>
			<v-list-item v-for="(name, i) in ['play', 'step-forward', 'stop']" :key="i">
				<v-list-item-icon class="ma-0">
					<v-btn depressed block class="pa-0 ma-0">
						<FontAwesomeIcon :icon="name" @click="onIconClick(name)"/>
					</v-btn>
				</v-list-item-icon>
			</v-list-item>
		</v-list>

		<OutputElement :value="outputText" style="flex: 1" />

		<VariableTable
			class="variable-viewer"
			:variables="variables"
			@change="onVariableChange"
		/>
	</v-row>
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

			//TODO: Allow setting variable value
			// v.tree = tree;
			v.type = conversionString;
			v.value = stringifyTree(tree, conversionString);
		}
	},
	mounted() {

	},
})
</script>


<style scoped>
.debugger-controls {
	/*width: 1em;*/
	/*padding: 0 .5em;*/
	/*float: left;*/
}

.run-panel-body {
	/*overflow-y: auto;*/
}

.output-holder {
	text-align: left;
	overflow-wrap: anywhere;
	/*flex: 1;*/
	/*margin-left: 10px;*/
}

.variable-viewer {
	/*float: right;*/
	/*min-width: 30em;*/
	/*max-width: 50%;*/
}

.output-holder, .variable-viewer {
	overflow-y: auto;
}
</style>
