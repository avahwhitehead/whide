<template>
	<div class="tabbedPanel">
		<draggable class="tabs" v-model="tabs" @end="onDragEnd">
			<TabButton
				class="tab"
				:title="tab"
				:active="tab === currentTab"
				@click="onTabClick($event, tab)"
				@close="onTabClose($event, tab)"
				v-for="(tab,i) in tabs" v-bind:key="i"
			/>
		</draggable>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import draggable from "vuedraggable";
import TabButton from "./_internal/tabbedPanel/TabButton.vue";

interface DataTypeInterface {
	selectedIndex: number;
	tabs: string[];
	currentTab: string|undefined,
}

export default Vue.extend({
	name: 'TabbedPanel',
	components: {
		TabButton,
		draggable,
	},
	props: {
		names: {
			type: Array as () => Array<string>,
			required: true,
		},
		selectedTab: {
			type: String,
			default: "",
		}
	},
	data() : DataTypeInterface {
		return {
			currentTab: undefined,
			selectedIndex: -1,
			tabs: [],
		}
	},
	watch: {
		/**
		 * Emit a change event if selected tab is different after the tab list is updated
		 */
		names(newTabs: string[]): void {
			//Use the currently focussed tab if possible
			let index = newTabs.indexOf(this.selectedTab);
			//Otherwise use the same index
			if (index === -1) index = Math.min(this.selectedIndex, this.tabs.length - 1);

			this.tabs = newTabs;
			this.currentTab = newTabs[index];
		},

		/**
		 * Update the selected index when a tab is externally set
		 */
		selectedTab(newSelected: string|undefined) {
			this.currentTab = newSelected;
		},

		currentTab(tab: string|undefined) {
			//If no tab is provided
			if (!tab) {
				if (this.tabs.length !== 0) {
					//Select the first tab in the list
					this.currentTab = this.tabs[0];
				} else {
					//There are no more tabs - alert watchers
					this.$emit("change", tab);
					this.selectedIndex = -1;
				}
				return;
			}

			//Get the index of the chosen tab
			let index = this.tabs.indexOf(tab);

			if (index >= 0) {
				//Use this tab if possible
				this.selectedIndex = index;
				this.$emit("change", tab);
			} else {
				//Otherwise use the tab at the same index
				index = Math.min(this.selectedIndex, this.tabs.length - 1);
				this.currentTab = this.tabs[index];
			}
		},
		/**
		 * Emit a change event when the selected tab is changed
		 */
		selectedIndex(index: number) {
			//Update the currentTab value to match the index
			this.currentTab = this.tabs[index];
		},
	},
	methods: {
		/**
		 * Handle a tab being selected
		 * @param event		The event object
		 * @param tab		The index of the tab requesting focus
		 */
		onTabClick(event : Event, tab : string) : void {
			//Set the tab as the current one
			this.currentTab = tab;
		},
		/**
		 * Handle a tab "close" button being clicked
		 * @param event		The event object
		 * @param tab		The index of the tab requesting the close
		 */
		onTabClose(event : Event, tab : string) : void {
			//Emit the close event
			this.$emit("close", tab);
		},
		/**
		 * Keep the selected tab focused after drag events
		 * @param args	Drag event
		 */
		onDragEnd({ oldIndex, newIndex }: { oldIndex: number, newIndex: number }) {
			if (this.selectedIndex === oldIndex) {
				//The selected tab was dragged - keep it selected
				this.selectedIndex = newIndex;
			} else {
				if (oldIndex < this.selectedIndex && newIndex >= this.selectedIndex) {
					//A tab before the selected was dragged to after it
					//Shift the selected index down
					this.selectedIndex--;
				} else if (oldIndex > this.selectedIndex && newIndex <= this.selectedIndex) {
					//A tab after the selected was dragged to before it
					//Shift the selected index up
					this.selectedIndex++;
				}
			}
		}
	}
});
</script>

<style scoped>

</style>