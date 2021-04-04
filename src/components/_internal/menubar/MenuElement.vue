<template>
	<div class="menuElement" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
		<div class="name" v-text="menu.name" />
		<div class="dropdown" :class="{ 'visible': dropdownVisible }">
			<MenuItemElement @run="passRunUp"
				v-for="(child,i) in menu.children" :item="child" :key="i"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import MenuItemElement from "@/components/_internal/menubar/MenuItemElement.vue";
import { InternalMenu } from "@/api/types/InternalMenus";
import Vue from "vue";
import { PluginInfo } from "@/api/PluginInfo";

interface DataTypeInterface {
	dropdownVisible: boolean;
}

export default Vue.extend({
	name: 'Menu',
	components: {
		MenuItemElement
	},
	props: {
		menu: {
			type: Object as () => InternalMenu,
		}
	},
	data() : DataTypeInterface {
		return {
			dropdownVisible: false,
		}
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
		}
	}
});
</script>


<style scoped>
.menuElement {
	display: inline-block;
	padding: 2px 5px;
	border: 1px solid black;
	background-color: #FFFFFF;
}

.name {
	width: 100%;
	user-select: none;
}

.dropdown {
	display: none;
	position: absolute;
	background: white;
	border: 1px solid black;
}

.dropdown.visible {
	display: block;
}
</style>
