<template>
	<div class="MenuBar">
		<MenuElement
			v-for="(menu, i) in menus" :key="i"
			:menu="menu"
			@run="passRunUp"
		/>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { InternalMenu } from "@/api/types/InternalMenus";
import MenuElement from "./_internal/menubar/MenuElement.vue";
import { PluginInfo } from "@/api/PluginInfo";

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
	methods: {
		passRunUp(data : { plugin: PluginInfo, command: string }) : void {
			this.$emit("run", data);
		}
	}
});
</script>

<style scoped>
.MenuBar {
	text-align: left;
}
</style>