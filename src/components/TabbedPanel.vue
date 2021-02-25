<template>
	<div class="tabbedPanel">
		<draggable class="tabs" v-model="tabs" @end="onDragEnd">
			<TabButton
				class="tab"
				:title="tab"
				:active="i === selectedIndex"
				@click="onTabClick($event, i)"
				@close="onTabClose($event, i)"
				v-for="(tab,i) in tabs" v-bind:key="i"
			/>
		</draggable>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import draggable from "vuedraggable";
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
/**
 * Make the elements of two arrays equal, maintaining the order of the second array as much as possible.
 * @returns an array containing all the elements of `newArr` (and no more) ordered first by `oldArr` then by `newArr`.
 */
function combineArrays<T>(newArr: T[], oldArr: T[]) : T[] {
	//Hold the indexes in `newArr` which already exist in `oldArr`
	let addedIndexes = new Set<number>();
	//Remove elements from `oldArr` which are not in `newArr`
	let result : T[] = oldArr.filter(value => {
		let i = newArr.indexOf(value);
		//Not in `newArr` - delete the element
		if (i === -1) return false;
		//Save the index and keep the element
		addedIndexes.add(i);
		return true;
	});

	//Add the missing elements from `newArr`
	for (let i = 0; i < newArr.length; i++) {
		if (!addedIndexes.has(i)) result.push(newArr[i]);
	}

	return result;
}

interface DataTypeInterface {
	selectedIndex: number;
	tabs: string[];
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
			selectedIndex: -1,
			tabs: [],
		}
	},
	watch: {
		/**
		 * Emit a change event if selected tab is different after the tab list is updated
		 */
		names(newTabs: string[], oldTabs: string[]) {
			//Use the new tab values, adding any new tabs to the end of the list
			//This stops tabs from jumping around when the list is changed
			this.tabs = combineArrays(newTabs, this.tabs);

			//Change the active tab if the change was opening a new file
			if (newTabs.length === oldTabs.length + 1) {
				//Get the added element in the list
				let addedItemIndex: number = getAddedElement(newTabs, oldTabs);
				//Focus on the added tab
				if (addedItemIndex > -1) this.selectedIndex = addedItemIndex;
			}
		},
		/**
		 * Update the selected index when a tab is externally set
		 */
		selectedTab(newSelected: string|undefined) {
			//If no tab is provided, explicitly do nothing
			if (!newSelected) {
				this.selectedIndex = -1;
				return;
			}
			//Update the selected index when the selected tab is externally set
			const i = this.tabs.indexOf(newSelected);
			if (i > -1) this.selectedIndex = i;
			else this.selectedIndex = 0;
		},
		/**
		 * Emit a change event when the selected tab is changed
		 */
		selectedIndex(index: number) {
			//Limit indexes to between the first and last tabs
			index = Math.max(index, 0);
			index = Math.min(index, this.tabs.length - 1);

			//Emit a change event only if the selected tab actually changes
			if (this.tabs[index] !== this.selectedTab) {
				this.$emit("change", this.tabs[index]);
			}
		},
	},
	methods: {
		/**
		 * Handle a tab being selected
		 * @param event		The event object
		 * @param index		The index of the tab requesting focus
		 */
		onTabClick(event : Event, index : number) : void {
			//Set the tab as the current one
			this.selectedIndex = index;
		},
		/**
		 * Handle a tab "close" button being clicked
		 * @param event		The event object
		 * @param index		The index of the tab requesting the close
		 */
		onTabClose(event : Event, index : number) : void {
			//Remove the tab from the list
			const removed = this.tabs[index];

			//If the selected tab is closing
			if (this.selectedIndex === index) {
				//Select the tab to the right if possible, otherwise use the one to the left
				if (this.selectedIndex === this.tabs.length - 1) this.selectedIndex--;
				else this.$emit("change", this.tabs[this.selectedIndex + 1]);
			}
			//If the selected tab's index will change, adjust it so the tab stays open
			else if (this.selectedIndex > index) this.selectedIndex--;

			//Remove the tab from the list
			this.tabs.splice(index);

			//Emit the close event
			this.$emit("close", removed);
		},
		/**
		 * Keep the selected tab focused after drag events
		 * @param args	Drag event
		 */
		onDragEnd(args: { oldIndex: number, newIndex: number }) {
			const oldIndex = args.oldIndex;
			const newIndex = args.newIndex;

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