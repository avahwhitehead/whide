<template>
	<div class="menuItem" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
		<div class="name" @click="onClick">{{ item.name }}</div>
		<div :class="{
			'dropdown': true,
			'visible':(dropdownVisible && (item.children || []).length)}"
		>
			<MenuItemElement v-for="(child,i) in item.children" :item="child" :key="i"></MenuItemElement>
		</div>
	</div>
</template>

<script lang="ts">
import { MenuItem } from "@/api/parsers/MenuParser";
import Vue from "vue";
import { PluginFunction } from "@/api/types/PluginFunction";

export default Vue.extend({
	name: 'MenuItemElement',
	components: {},
	mounted() {

	},
	props: {
		item: {
			type: Object as () => MenuItem,
		}
	},
	data() {
		return {
			dropdownVisible: false,
		}
	},
	methods: {
		onMouseEnter() {
			this.dropdownVisible = true;
		},
		onMouseLeave() {
			this.dropdownVisible = false;
		},
		async onClick() {
			//Shorthand access to the menu item
			let item : MenuItem = this.$props.item;
			//Get the function linked to the menu item
			let pluginFunction : PluginFunction|undefined = await item.plugin.getFunc(item.command);

			//TODO: Find better way of passing parameters
			//Run the function if possible
			if (pluginFunction) pluginFunction.run({args: {}, console: console});
			//Error otherwise
			else console.error(`Couldn't find function ${item.command} in plugin ${item.plugin.name}`);
		},
	}
});
</script>


<style scoped>
.menuItem {
	width: 100%;
}

.menuItem:hover {
	cursor: pointer;
	background: #AAAAAA;
}

.name {
	display: inline;
	width: 100%;
}

.dropdown {
	display: none;
	float: right;
	background: white;
	border: 1px solid black;
}

.dropdown.visible {
	display: inline-block;
}
</style>
