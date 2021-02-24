<template>
	<div class="tabbedPanel">
		<div class="tabs">
			<TabButton
				class="tab"
				:title="tab"
				:active="i === selectedTab"
				@click="onTabClick($event, i)"
				@close="onTabClose($event, i)"
				v-for="(tab,i) in names" v-bind:key="i"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import TabButton from "./_internal/tabbedPanel/TabButton.vue";

/**
 * Get the index of an item added to a list.
 * @param newList	The list of items after the item was added
 * @param oldList	The list of items without the added item
 * @returns	The index of the added item if exactly one item was added and no other changes were made. -1 otherwise.
 */
function getAddedElement<T>(newList: T[], oldList: T[]) : number {
	let addedItemIndex: number = -1;
	//List pointers
	let j = 0;
	for (let i = 0; i < newList.length; i++) {
		//See if the list indexes don't match
		if (newList[i] !== oldList[j]) {
			//This is not the first difference - return that this is invalid
			if (addedItemIndex > -1) return -1;
			//Otherwise save the index
			addedItemIndex = i;
			//Don't increment the new list's pointer because all the following elements should be offset by -1
			//(assuming no other changes)
		} else {
			//The index is the same - increment both pointers
			j++;
		}
	}
	//Return the changed index
	return addedItemIndex;
}

interface DataTypeInterface {
	selectedTab: number;
}

export default Vue.extend({
	name: 'TabbedPanel',
	components: {
		TabButton
	},
	props: {
		names: Array,
	},
	data() : DataTypeInterface {
		return {
			selectedTab: 0,
		}
	},
	watch: {
		/**
		 * Emit a change event if selected tab is different after the tab list is updated
		 */
		names: function (newTabs: string[], oldTabs: string[]) {
			if (newTabs[this.selectedTab] !== oldTabs[this.selectedTab]) {
				this.setActiveTab(this.selectedTab, true);
				return;
			}
			//Change the active tab if the change was opening a new file
			if (newTabs.length === oldTabs.length + 1) {
				//Get the added element in the list
				let addedItemIndex: number = getAddedElement(newTabs, oldTabs);
				//Focus on the added tab
				if (addedItemIndex > -1) this.setActiveTab(addedItemIndex);
			}
		}
	},
	methods: {
		/**
		 * Handle a tab being selected
		 *
		 * @param event		The event object
		 * @param index		The index of the tab requesting focus
		 */
		onTabClick(event : Event, index : number) : void {
			this.setActiveTab(index);
		},
		/**
		 * Handle a tab "close" button being clicked
		 * @param event		The event object
		 * @param index		The index of the tab requesting the close
		 */
		onTabClose(event : Event, index : number) : void {
			//Emit the close event
			this.$emit("close", index);
			//If the selected tab will be affected by an index being removed
			if (this.selectedTab >= index) {
				//Update the index
				this.setActiveTab(this.selectedTab - 1, true);
			}
		},
		/**
		 * Change the active tab, and emit a tab change event if required.
		 * By default only emits an event if the index changes (can be changed with <code>force</code>.
		 * @param index		The new index of the tab
		 * @param force		Whether to emit an event regardless of whether or not the index changed
		 */
		setActiveTab(index : number, force : boolean = false) : void {
			//Limit indexes to between the first and last tabs
			index = Math.max(index, 0);
			index = Math.min(index, this.names.length - 1);

			//Only if the index has changed
			if (index !== this.selectedTab || force) {
				this.selectedTab = index;
				this.$emit("change", this.selectedTab);
			}
		},
	}
});
</script>

<style scoped>

</style>