<template>
	<v-card class="pa-0 ma-0 run-panel-holder">
		<v-card-text
			v-text="'Run a program to view it here'"
			v-if="!outputs.length"
		/>

		<v-tabs
			v-model="selectedTab"
			ref="sortableTabs"
			:hide-slider="true"
			class="tabs-holder"
		>
			<v-tab
				v-for="(tab, i) in outputs" :key="i"
				@click.middle="onTabClose(tab.runner)"
			>
				<span class="tab-name">{{tab.name}}</span>
				<FontAwesomeIcon icon="times" class="tab-close" @click="onTabClose(tab.runner)" />
			</v-tab>
		</v-tabs>

		<v-tabs-items v-model="selectedTab" class="tab-items-container fill-height">
			<v-tab-item
				v-for="(tab, i) in outputs" :key="i"
				:transition="false"
				class="tab-item"
			>
				<RunInterface :runner="tab.runner" />
			</v-tab-item>
		</v-tabs-items>
	</v-card>
</template>

<script lang="ts">
import Vue from "vue";
import RunPanelController from "@/api/controllers/RunPanelController";
import RunInterface from "@/components/_internal/runPanel/RunInterface.vue";
import Sortable, { SortableEvent } from "sortablejs";
import { AbstractRunner } from "@/run/AbstractRunner";

interface DataTypeDescriptor {
	runPanelController?: RunPanelController;
	selectedTab: AbstractRunner|undefined;
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
		outputs(): { name: string, runner: AbstractRunner }[] {
			return this.runPanelController?.controllers || [];
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
			const movedItem = this.outputs.splice(event.oldIndex! - 1, 1)[0];
			this.outputs.splice(event.newIndex!, 0, movedItem);
		},

		async onTabClose(closed: AbstractRunner) {
			//Shouldn't happen
			if (!this.runPanelController) throw new Error("Couldn't get run panel controller");

			//Stop the runner
			closed.stop();

			//Remove the instance controller
			await this.runPanelController.removeOutputStream(closed);
		},
	},
	watch: {
		outputs(tabs: AbstractRunner[], oldTabs: AbstractRunner[]) {
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
.run-panel-holder {
	width: 100%;
	display: flex;
	flex-direction: column;
	overflow-y: hidden;
}

.tabs-holder {
	flex: 0;
}

.tab-name {
	text-transform: none !important;
}

.tab-items-container {
	flex: 1;
}
.tab-item {
	height: 100%;
}

.tab-close {
	margin-left: .5em;
}
</style>
