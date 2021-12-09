<!--
Stylings based on this example:
https://csslayout.io/patterns/nested-dropdowns/
-->

<template>
	<ul class="MenuBar">
		<MenuElement
			v-for="(menu, i) in menus" :key="i"
			:menu="menu"
			@click="onClick"
		/>
	</ul>
</template>

<script lang="ts">
import Vue from "vue";
import { Menu, MenuItem } from "@/types";
import MenuElement from "./_internal/menubar/MenuElement.vue";

interface DataTypeInterface {
	selectedTab: number;
}

export default Vue.extend({
	name: 'MenuBar',
	components: {
		MenuElement,
	},
	props: {
		menus: {
			type: Array as () => Array<Menu>,
			default: () => [],
		},
	},
	data() : DataTypeInterface {
		return {
			selectedTab: 0,
		}
	},
	methods: {
		async onClick(item: MenuItem): Promise<void> {
			//Run the command
			if (!item.command) return;
			item.command();
		},
	}
});
</script>

<style scoped>
.MenuBar {
	border: 1px solid black;
	margin: 0;
	padding: 0;
}
</style>
