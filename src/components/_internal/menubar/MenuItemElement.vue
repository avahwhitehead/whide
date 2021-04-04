<template>
	<div class="menuItem" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave" @click="onClick">
		<div class="name" v-text="item.name" />
		<div class="dropdown" :class="{ 'visible': isVisible }">
			<MenuItemElement @run="passRunUp"
				v-for="(child,i) in item.children" :item="child" :key="i"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import { InternalMenu, InternalMenuItem } from "@/api/types/InternalMenus";
import Vue from "vue";
import { PluginInfo } from "@/api/PluginInfo";

interface DataTypeInterface {
	dropdownVisible: boolean;
}

export default Vue.extend({
	name: 'MenuItemElement',
	props: {
		item: {
			type: Object as () => InternalMenuItem|InternalMenu,
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
			//Invisible if there are no children
			const children: (InternalMenu | InternalMenuItem)[] = (this.item as InternalMenu).children || [];
			return children.length > 0;
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
			let item : InternalMenuItem = this.$props.item;

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
	user-select: none;
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
