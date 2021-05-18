<template>
	<div class="root">
		<Container
			:left="['play', 'step-forward', 'stop']"
			@iconClick="onIconClick"
		>
			<div class="DebuggerPanel">
				<div class="tabs-holder">
					<TabbedPanel
						:names="tabNames"
						:selected-tab="selectedTab"
						@change="onTabChange"
						@close="onTabClose"
					/>
				</div>

				<div class="run-panel-body">
					<div class="output-holder">
						<OutputElement v-if="instanceController" :value="instanceController.output" />
					</div>

					<div class="variable-viewer" v-if="variables.length">
						<VariableTable :variables="variables" />
					</div>
				</div>
			</div>
		</Container>
		<InputPrompt @controller="(controller) => this.ioController = controller" />
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import TabbedPanel from "@/components/TabbedPanel.vue";
import RunPanelController, { RunPanelInstanceController } from "@/api/controllers/RunPanelController";
import { DebuggerControllerInterface, IOController } from "@/types";
import Container from "@/components/Container.vue";
import VariableTable from "@/components/_internal/runPanel/VariableTable.vue";
import { BinaryTree } from "@whide/tree-lang";
import OutputElement from "@/components/_internal/runPanel/OutputElement.vue";
import InputPrompt from "@/components/InputPrompt.vue";
import { ProgramState } from "@/run/AbstractRunner";

interface DataTypeDescriptor {
	runPanelController?: RunPanelController;
	instanceController?: RunPanelInstanceController;
	selectedTab?: string;
	ioController?: IOController,
}

export default Vue.extend({
	name: 'RunPanel',
	components: {
		InputPrompt,
		OutputElement,
		Container,
		TabbedPanel,
		VariableTable,
	},
	props: {},
	data() : DataTypeDescriptor {
		return {
			runPanelController: undefined,
			instanceController: undefined,
			selectedTab: undefined,
			ioController: undefined,
		}
	},
	computed: {
		variables() : {name: string, value:BinaryTree}[] {
			if (!this.instanceController) return [];
			let vars = this.instanceController.variables;
			let res = [];
			for (let v of Object.keys(vars)) {
				res.push({
					name: v,
					value: vars[v],
				});
			}
			return res;
		},
		tabNames() : string[] {
			if (!this.runPanelController) return [];
			return this.runPanelController.names;
		}
	},
	mounted() {
		this.runPanelController = new RunPanelController();
		this.$emit('controller', this.runPanelController);
	},
	methods: {
		async onTabChange(selected : string|undefined) {
			this.selectedTab = selected;
		},
		async onTabClose(closed : string) {
			//Shouldn't happen
			if (!this.runPanelController) throw new Error("Couldn't get run panel controller");
			//Get the tab's controller
			const instanceController: RunPanelInstanceController|undefined = await this.runPanelController.getByName(closed);
			if (!instanceController) return;
			//Remove the instance controller
			await this.runPanelController.removeOutputStream(instanceController);
		},
		async onIconClick(icon: string) {
			const debuggerCallbackHandler : DebuggerControllerInterface|undefined = this.instanceController?.debuggerCallbackHandler;
			if (!debuggerCallbackHandler) {
				this.ioController?.prompt({
					title: 'No files running',
					message: 'Start debugging a program to use these controls',
					options: ['Ok']
				});
				return;
			}

			//Perform the command and read the resulting program state
			let newState: ProgramState|undefined;
			if (icon === 'play') newState = await debuggerCallbackHandler.run();
			else if (icon === 'step-forward') newState = await debuggerCallbackHandler.step();
			else if (icon === 'stop') debuggerCallbackHandler.stop();

			if (newState !== undefined) {
				//Update the variable store
				if (newState.variables !== undefined) {
					//Convert to the right type
					//TODO: Convert RunPanel to use nested BinaryTree Maps
					let vars: {[key:string]: BinaryTree} = {};
					//Iterate over the programs first
					for (let [p, m] of newState.variables) {
						//Iterate over each program's variable, prefixing the name
						for (let [k, v] of m) vars[`(${p}) ${k}`] = v;
					}
					this.instanceController!.variables = vars;
				}
			}
		}
	},
	watch: {
		async selectedTab(selected: string|undefined) {
			//Shouldn't happen
			if (!this.runPanelController) throw new Error("Couldn't get run panel controller");
			//Set the active instance controller
			if (selected === undefined) this.instanceController = undefined;
			else this.instanceController = await this.runPanelController.getByName(selected);
		},
		tabNames(tabs: string[], oldTabs: string[]) {
			//If a new tab is opened, select that
			if (oldTabs.length + 1 === tabs.length) {
				this.selectedTab = tabs[tabs.length - 1];
			}
		}
	}
})
</script>


<style scoped>
.root {
	display: flex;
	flex-direction: column;
	flex: 1;
	overflow: hidden;
}

.DebuggerPanel {
	display: flex;
	flex-direction: column;
	flex: 1;
	overflow: hidden;
}

.run-panel-body {
	display: flex;
	flex-direction: row;
	flex: 1;
	overflow-y: auto;
}

.tabs-holder {

}

.output-holder {
	text-align: left;
	overflow-wrap: anywhere;
	flex: 1;
	margin-left: 10px;
}

.variable-viewer {
	float: right;
	min-width: 30em;
	max-width: 50%;
}

.output-holder, .variable-viewer {
	overflow-y: auto;
}
</style>
