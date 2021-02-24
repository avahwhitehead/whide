<template>
	<Container :left="['play', 'undo', 'bug', 'stop']">
		<div class="DebuggerPanel">
			<div class="tabs-holder">
				<TabbedPanel :names="runPanelController.names" @change="onTabChange" @close="onTabClose"></TabbedPanel>
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
	runPanelController: RunPanelController,
	instanceController: RunPanelInstanceController|undefined,
}

export const runPanelController = new RunPanelController();

export default Vue.extend({
	name: 'RunPanel',
	components: {
		Container,
		TabbedPanel
	},
	props: {},
	data() : DataTypeDescriptor {
		return {
			runPanelController: runPanelController,
			instanceController: undefined,
		}
	},
	methods: {
		onTabChange(selected : number) {
			this.instanceController = this.runPanelController.controllers[selected];
		},
		onTabClose(closed : number) {
			const controller = this.runPanelController.controllers[closed];
			this.runPanelController.removeOutputStream(controller);
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
