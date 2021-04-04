<template>
	<li class="menu-item">
		<div @click="onClick">
			<span class="name-holder" v-text="menu.name" />
			<span class="child-indicator" v-if="isParent && showPopoutIcon">&nbsp;&gt;</span>
		</div>

		<ul v-if="isParent">
			<MenuElement
				v-for="(child,i) in menu.children" :item="child" :key="i"
				:menu="child"
				:show-popout-icon="true"
				@run="passRunUp"
			/>
		</ul>
	</li>
</template>

<script lang="ts">
import { InternalMenu, InternalMenuItem } from "@/api/types/InternalMenus";
import Vue, { PropType } from "vue";
import { PluginInfo } from "@/api/PluginInfo";

interface DataTypeInterface {

}

export default Vue.extend({
	name: 'MenuElement',
	components: {
	},
	props: {
		menu: {
			type: Object as PropType<InternalMenu|InternalMenuItem>,
		},
		showPopoutIcon: {
			type: Boolean,
			default: false,
		}
	},
	computed: {
		isParent(): boolean {
			const menu = this.menu as InternalMenu;
			return menu.children && (menu.children.length > 0);
		}
	},
	data() : DataTypeInterface {
		return {

		}
	},
	methods: {
		passRunUp(data : { plugin: PluginInfo, command: string }) : void {
			this.$emit("run", data);
		},
		async onClick() : Promise<void> {
			//Shorthand access to the menu item
			let item : InternalMenuItem = this.menu as InternalMenuItem;
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
.name-holder {

}

.child-indicator {
	text-align: right;
	float: right;
	color: grey;
	height: 1em;
	vertical-align: middle;
}

/*Submenu styling*/
ul {
	width: 100px;

	display: none;
	border: 1px solid black;

	position: absolute;
	left: 0;
	top: 100%;
	margin: 0;
	padding: 0;

	/*Hide bullets*/
	list-style-type: none;
}

ul .menu-item {
	position: relative;

	padding: 8px;
	background: white;
}

/*Set background color on hover*/
ul .menu-item:hover {
	background-color: #AAAAAA;
}

/*Show the submenu on hover*/
ul .menu-item:hover > ul {
	display: block;
}
</style>
