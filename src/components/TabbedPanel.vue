<template>
	<div class="tabbedPanel">
		<div class="tabs">
			<TabButton
					:class="{tab: true, active: i===selectedTab}"
					@click="onTabClick($event, i)"
					@close="onTabClose($event, i)"
					v-for="(tab,i) in names" v-bind:key="i">
				{{ tab }}
			</TabButton>
		</div>
		<div class="content">
			<slot />
		</div>
	</div>
</template>

<script>
import TabButton from "@/components/tabbedPanel/TabButton";

export default {
	name: 'TabbedPanel',
	components: {
		TabButton
	},
	props: {
		names: Array,
	},
	data() {
		return {
			selectedTab: 0,
		}
	},
	watch: {
		/**
		 * Emit a change event if selected tab is different after the tab list is updated
		 */
		names: function (newTabs, oldTabs) {
			if (newTabs[this.selectedTab] !== oldTabs[this.selectedTab]) {
				this.setActiveTab(this.selectedTab, true);
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
		onTabClick(event, index) {
			this.setActiveTab(index);
		},
		/**
		 * Handle a tab "close" button being clicked
		 * @param event		The event object
		 * @param index		The index of the tab requesting the close
		 */
		onTabClose(event, index) {
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
		setActiveTab(index, force=false) {
			//Limit indexes to between the first and last tabs
			index = Math.max(index, 0);
			index = Math.min(index, this.names.length);

			//Only if the index has changed
			if (index !== this.selectedTab || force) {
				this.selectedTab = index;
				this.$emit("change", this.selectedTab);
			}
		},
	}
}

</script>

<style scoped>
.tab.active {
	border-color: red;
}
</style>