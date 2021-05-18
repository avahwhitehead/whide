<template>
	<li class="menu-item">
		<div @click="() => passRunUp(menu)">
			<span class="name-holder" v-text="menu.name" />
			<span class="child-indicator" v-if="isParent && showPopoutIcon">&nbsp;&gt;</span>
		</div>

		<ul v-if="isParent">
			<MenuElement
				v-for="(child,i) in menu.children" :item="child" :key="i"
				@click="passRunUp"
				:menu="child"
				:show-popout-icon="true"
			/>
		</ul>
	</li>
</template>

<script lang="ts">
import { Menu, MenuItem } from "@/types";
import Vue, { PropType } from "vue";

interface DataTypeInterface {

}

export default Vue.extend({
	name: 'MenuElement',
	components: {
	},
	props: {
		menu: {
			type: Object as PropType<Menu|MenuItem>,
		},
		showPopoutIcon: {
			type: Boolean,
			default: false,
		}
	},
	computed: {
		isParent(): boolean {
			const menu = this.menu as Menu;
			return menu.children && (menu.children.length > 0);
		}
	},
	data() : DataTypeInterface {
		return {};
	},
	methods: {
		passRunUp(menu: MenuItem) : void {
			this.$emit("click", menu);
		},
	}
});
</script>

<!--suppress CssUnusedSymbol -->
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

	padding: 4px 8px;
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
