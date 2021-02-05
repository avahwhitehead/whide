<template>
	<div class="menuItem" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
		<div class="name" @click="onClick">{{ item.name }}</div>
		<div :class="{ 'dropdown': true, 'visible': isVisible, }">
			<MenuItemElement @run="passRunUp"
				v-for="(child,i) in item.children" :item="child" :key="i"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { Menu, MenuItem } from "@/api/parsers/MenuParser";
import Vue from "vue";
import { PluginInfo } from "@/api/types/PluginInfo";

interface DataTypeInterface {
	dropdownVisible: boolean;
}

export default Vue.extend({
	name: 'MenuItemElement',
	props: {
		item: {
			type: Object as () => MenuItem|Menu,
		}
	},
	data() : DataTypeInterface {
		return {
			dropdownVisible: false,
		}
	},
	computed: {
		isVisible() : boolean {
			if (!this.dropdownVisible) return false;
			if (!(<Menu>this.item).children) return false;
			return (<Menu>this.item).children.length > 0;
		},
	},
	methods: {
		onMouseEnter() : void {
			this.dropdownVisible = true;
		},
		onMouseLeave() : void {
			this.dropdownVisible = false;
		},
		passRunUp(data : { plugin: PluginInfo, command: string }) : void {
			this.$emit("run", data);
		},
		async onClick() : Promise<void> {
			//Shorthand access to the menu item
			let item : MenuItem = this.$props.item;

			//Don't do anything if the item doesn't have a command to run
			if (item.command) {
				this.$emit("run", {
					plugin: item.plugin,
					command: item.command,
				});
			}
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
