<template>
	<div class="menuElement" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
		<div class="name">{{ menu.name }}</div>
		<div :class="{'dropdown': true, 'visible':dropdownVisible}">
			<MenuItemElement v-for="(child,i) in menu.children" :item="child" :key="i"></MenuItemElement>
		</div>
	</div>
</template>

<script lang="ts">
import MenuItemElement from "@/components/menubar/MenuItemElement.vue";
import { Menu } from "@/api/parsers/MenuParser";
import Vue from "vue";

export default Vue.extend({
	name: 'Menu',
	components: {
		MenuItemElement
	},
	props: {
		menu: {
			type: Object as () => Menu,
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
	}
});
</script>


<style scoped>
.menuElement {
	display: inline-block;
	padding: 2px 5px;
	border: 1px solid black;
}

.name {
	width: 100%;
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
