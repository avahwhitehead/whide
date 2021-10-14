<template>
	<v-card class="pa-0 ma-0 run-panel-holder">
		<v-card-text
			v-text="'Run a program to view it here'"
			v-if="!runners.length"
		/>

		<v-tabs
			v-model="selectedTab"
			ref="sortableTabs"
			:hide-slider="true"
			class="tabs-holder"
		>
			<v-tab
				v-for="(tab, i) in runners" :key="i"
				@click.middle="onTabClose(tab.runner)"
			>
				<span class="tab-name">{{tab.name}}</span>
				<FontAwesomeIcon icon="times" class="tab-close" @click="onTabClose(tab.runner)" />
			</v-tab>
		</v-tabs>

		<v-tabs-items
			v-model="selectedTab"
			class="tab-items-container fill-height"
		>
			<v-tab-item
				v-for="(tab, i) in runners" :key="i"
				:transition="false"
				class="tab-item"
			>
				<RunInterface :runner="tab.runner" />
			</v-tab-item>
		</v-tabs-items>
	</v-card>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import RunInterface from "@/components/_internal/runPanel/RunInterface.vue";
import Sortable, { SortableEvent } from "sortablejs";
import { AbstractRunner } from "@/run/AbstractRunner";

interface DataTypeDescriptor {
	selectedTab: number;
}

export default Vue.extend({
	name: 'RunPanel',
	components: {
		RunInterface,
	},
	props: {
		runners: Array as PropType<{ name: string, runner: AbstractRunner }[]>
	},
	data() : DataTypeDescriptor {
		return {
			selectedTab: 0,
		}
	},
	mounted() {
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
			const movedItem = this.runners.splice(event.oldIndex! - 1, 1)[0];
			this.runners.splice(event.newIndex!, 0, movedItem);
		},

		async onTabClose(closed: AbstractRunner) {
			//Stop the runner
			closed.stop();

			//Remove the instance controller
			this.runners?.splice(
				this.runners?.findIndex(e => e.runner === closed),
				1
			)
		},
	},
	watch: {
		runners(tabs: { name: string, runner: AbstractRunner }[]) {
			this.selectedTab = tabs.length - 1;
		},
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
