<!--
Stylings based on this example:
https://csslayout.io/patterns/nested-dropdowns/
-->

<template>
	<ul class="MenuBar">
		<MenuElement
			v-for="(menu, i) in menus" :key="i"
			:menu="menu"
		/>
	</ul>
</template>

<script lang="ts">
import Vue from "vue";
import { InternalMenu } from "@/api/types/InternalMenus";
import MenuElement from "./_internal/menubar/MenuElement.vue";

interface DataTypeInterface {
	selectedTab: number;
}

export default Vue.extend({
	name: 'MenuBar',
	components: {
		MenuElement
	},
	props: {
		menus: {
			type: Array as () => Array<InternalMenu>,
			default: () => [],
		},
	},
	data() : DataTypeInterface {
		return {
			selectedTab: 0,
		}
	},
});
</script>

<style scoped>
.MenuBar {
	display: flex;

	border: 1px solid black;
	margin: 0;
	padding: 0;

	/*Hide bullets*/
	list-style-type: none;
}
</style>

<style>
/* Show dropdowns above everything else */
.MenuBar li, .MenuBar ul {
	z-index: 100;
}

/* Display nested dropdowns next to their parent */
.MenuBar ul ul {
	left: 100%;
	position: absolute;
	top: 0;
}
</style>