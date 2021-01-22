<template>
	<div class="menuItem" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
		<div class="name" @click="onClick">{{ item.name }}</div>
		<div :class="{
			'dropdown': true,
			'visible':(dropdownVisible && (item.children || []).length)}"
		>
			<MenuItemElement @run="passRunUp"
				v-for="(child,i) in item.children" :item="child" :key="i"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { MenuItem } from "@/api/parsers/MenuParser";
import Vue from "vue";
import { PluginInfo } from "@/api/types/PluginInfo";

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
		passRunUp(data : { plugin: PluginInfo, command: string }) {
			this.$emit("run", data);
		},
		async onClick() {
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
