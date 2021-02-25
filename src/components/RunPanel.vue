<template>
	<Container :left="['play', 'undo', 'bug', 'stop']">
		<div class="DebuggerPanel">
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
	</Container>
</template>

<script lang="ts">
import Vue from "vue";
import TabbedPanel from "@/components/TabbedPanel.vue";
import RunPanelController, { RunPanelInstanceController } from "@/api/controllers/RunPanelController";
import Container from "@/components/Container.vue";

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
	},
	props: {},
	data() : DataTypeDescriptor {
		return {
			runPanelController: runPanelController,
			instanceController: undefined,
			selectedTab: undefined,
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
	}
})
</script>


<style scoped>
.output-holder {
	text-align: left;
	overflow-wrap: anywhere;
	overflow-y: auto;
	width: 100%;
}

.output {
	white-space: pre-wrap;
	width: 100%;
}
</style>
