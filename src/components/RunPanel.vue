<template>
	<Container :left="['play', 'step-forward', 'stop']" @iconClick="onIconClick">
		<div class="DebuggerPanel">
			<div class="run-content">
				<div class="tabs-holder">
					<TabbedPanel
						:names="runPanelController.names"
						:selected-tab="selectedTab"
						@change="onTabChange"
						@close="onTabClose"
					/>
				</div>

				<div class="output-holder">
					<code class="output" v-if="instanceController">{{ instanceController.output }}</code>
				</div>
			</div>

			<div class="variable-viewer">
				<VariableTable :variables="variables" />
			</div>
		</div>
	</Container>
</template>

<script lang="ts">
import Vue from "vue";
import TabbedPanel from "@/components/TabbedPanel.vue";
import RunPanelController, { RunPanelInstanceController } from "@/api/controllers/RunPanelController";
import { DebuggerControllerInterface } from "@whide/whide-types";
import Container from "@/components/Container.vue";
import VariableTable from "@/components/_internal/runPanel/VariableTable.vue";
import { BinaryTree } from "@whide/hwhile-wrapper";

interface DataTypeDescriptor {
	runPanelController: RunPanelController;
	instanceController: RunPanelInstanceController|undefined;
	selectedTab?: string;
}

export const runPanelController = new RunPanelController();

export default Vue.extend({
	name: 'RunPanel',
	components: {
		Container,
		TabbedPanel,
		VariableTable,
	},
	props: {},
	data() : DataTypeDescriptor {
		return {
			runPanelController: runPanelController,
			instanceController: undefined,
			selectedTab: undefined,
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
		}
	},
	methods: {
		async onTabChange(selected : string) {
			this.selectedTab = selected;
			this.instanceController = await this.runPanelController.getByName(selected);
		},
		async onTabClose(closed : string) {
			const instanceController: RunPanelInstanceController|undefined = await this.runPanelController.getByName(closed);
			if (!instanceController) return;
			//Remove the instance controller
			await this.runPanelController.removeOutputStream(instanceController);
		},
		onIconClick(icon: string) {
			if (!this.instanceController) return;
			const debuggerCallbackHandler : DebuggerControllerInterface|undefined = this.instanceController.debuggerCallbackHandler;
			if (!debuggerCallbackHandler) return;

			if (icon === 'play') debuggerCallbackHandler.run();
			if (icon === 'step-forward') debuggerCallbackHandler.step();
			if (icon === 'stop') debuggerCallbackHandler.stop();
		}
	}
})
</script>


<style scoped>
.run-content {
	display: flex;
	flex-direction: row;
}

.output-holder {
	text-align: left;
	overflow-wrap: anywhere;
	overflow-y: auto;
	flex: 1;
}

.output {
	white-space: pre-wrap;
	max-width: 100%;
}

.run-content, .variable-viewer {
	display: inline-block;
}

.variable-viewer {
	float: right;
	min-width: 30em;
	width: 20%;
	max-width: 50%;
}
</style>
