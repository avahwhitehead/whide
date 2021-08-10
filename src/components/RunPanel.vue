<template>
	<v-container class="pa-0 ma-0">
		<v-tabs
			v-model="selectedTab"
			ref="sortableTabs"
			:hide-slider="true"
		>
			<v-tab
				v-for="(tab, i) in outputs" :key="i"
				@click.middle="onTabClose(tab)"
			>
				<span class="tab-name">{{tab.name}}</span>
				<FontAwesomeIcon icon="times" class="tab-close" @click="onTabClose(tab)" />
			</v-tab>
		</v-tabs>

		<v-tabs-items v-model="selectedTab">
			<v-tab-item
				v-for="(tab, i) in outputs" :key="i"
				:transition="false"
			>
				<RunInterface :instance-controller="tab" style="text-align: left" />
			</v-tab-item>
		</v-tabs-items>
	</v-container>
</template>

<script lang="ts">
import Vue from "vue";
import RunPanelController, { RunPanelInstanceController } from "@/api/controllers/RunPanelController";
import RunInterface from "@/components/_internal/runPanel/RunInterface.vue";
import Sortable, { SortableEvent } from "sortablejs";

interface DataTypeDescriptor {
	runPanelController?: RunPanelController;
	selectedTab: RunPanelInstanceController|undefined;
}

export default Vue.extend({
	name: 'RunPanel',
	components: {
		RunInterface,
	},
	props: {},
	data() : DataTypeDescriptor {
		return {
			runPanelController: undefined,
			selectedTab: undefined,
		}
	},
	computed: {
		outputs(): RunPanelInstanceController[] {
			if (!this.runPanelController) return [];
			return this.runPanelController.controllers;
		}
	},
	mounted() {
		this.runPanelController = new RunPanelController();
		this.$emit('controller', this.runPanelController);

		//HTML element containing the tab elements
		let tabsHolder = (this.$refs.sortableTabs! as Vue).$el.getElementsByClassName('v-slide-group__content')[0];
		//Allow dragging to reorder the tabs
		new Sortable(
			tabsHolder as HTMLElement,
			{onEnd: this.onTabDragEnd}
		);
	},
	methods: {
		onTabDragEnd(event: SortableEvent): any {
			const movedItem: RunPanelInstanceController = this.outputs.splice(event.oldIndex! - 1, 1)[0];
			this.outputs.splice(event.newIndex!, 0, movedItem);
		},

		async onTabClose(closed : RunPanelInstanceController) {
			//Shouldn't happen
			if (!this.runPanelController) throw new Error("Couldn't get run panel controller");

			//Remove the instance controller
			await this.runPanelController.removeOutputStream(closed);
		},
	},
	watch: {
		outputs(tabs: RunPanelInstanceController[], oldTabs: RunPanelInstanceController[]) {
			//If a new tab is opened, select that
			if (oldTabs.length + 1 === tabs.length) {
				// this.selectedTab = tabs[tabs.length - 1];
				this.selectedTab = tabs.find(t => oldTabs.indexOf(t) === -1);
			}
		}
	}
})
</script>


<style scoped>
/*.DebuggerPanel {*/
/*	display: flex;*/
/*	flex-direction: row;*/
/*	flex: 1;*/
/*	overflow: hidden;*/
/*}*/

/*.debugger-controls {*/
/*	width: 1em;*/
/*	padding: 0 .5em;*/
/*}*/

/*.run-panel-body {*/
/*	display: flex;*/
/*	flex-direction: row;*/
/*	flex: 1;*/
/*	overflow-y: auto;*/
/*}*/

/*.output-holder {*/
/*	text-align: left;*/
/*	overflow-wrap: anywhere;*/
/*	flex: 1;*/
/*	margin-left: 10px;*/
/*}*/

/*.variable-viewer {*/
/*	float: right;*/
/*	min-width: 30em;*/
/*	max-width: 50%;*/
/*}*/

/*.output-holder, .variable-viewer {*/
/*	overflow-y: auto;*/
/*}*/
</style>
