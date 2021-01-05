<template>
	<div class="menuItem" @mouseenter="onMouseEnter" @mouseleave="onMouseLeave">
		<div class="name">{{ item.name }}</div>
		<div :class="{
			'dropdown': true,
			'visible':(dropdownVisible && (item.children || []).length)}"
		>
			<MenuItemElement v-for="(child,i) in item.children" :item="child" :key="i"></MenuItemElement>
		</div>
	</div>
</template>

<script lang="ts">
import { Menu } from "@/api/parsers/MenuParser";
import Vue from "vue";

export default Vue.extend({
	name: 'MenuItemElement',
	components: {},
	mounted() {

	},
	props: {
		item: {
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
