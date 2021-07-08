<template>
		<v-menu :offset-x='isOffsetX' :offset-y='isOffsetY' :open-on-hover='isOpenOnHover' :transition='transition'>
			<template v-slot:activator="{ on }">
				<!--suppress JSCheckFunctionSignatures -->
				<v-list-item v-if='isSubMenu' class='d-flex justify-space-between' v-on="on" @click="passRunUp(menu)">
					{{ menu.name }}
					<FontAwesomeIcon v-if="hasChildren" icon="chevron-right" />
				</v-list-item>

				<v-btn v-else v-on="on"
					text tile
					v-text="menu.name"
				/>
			</template>

			<template v-if="hasChildren">
				<v-list>
					<MenuElement
						v-for="(child, index) in childElements"
						:key='index'

						@click='m => passRunUp(m)'
						:menu="child"
						:is-open-on-hover='true'
						:is-offset-x='true'
						:is-offset-y='false'
						:is-sub-menu='true'
					/>
				</v-list>
			</template>
		</v-menu>
</template>

<script lang="ts">
import { Menu, MenuItem } from "@/types";
import Vue, { PropType } from "vue";

interface DataTypeInterface {

}

export default Vue.extend({
	name: 'MenuElement',
	props: {
		menu: Object as PropType<Menu|MenuItem>,
		isOffsetX: { type: Boolean, default: false },
		isOffsetY: { type: Boolean, default: true },
		isOpenOnHover: { type: Boolean, default: false },
		isSubMenu: { type: Boolean, default: false },
		transition: { type: String, default: 'scale-transition' }
	},
	computed: {
		childElements(): (Menu|MenuItem)[] {
			return (this.menu as Menu).children || [];
		},
		hasChildren(): boolean {
			return this.childElements.length > 0;
		},
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
.child-indicator {
	text-align: right;
	float: right;
	color: grey;
	height: 1em;
	vertical-align: middle;
}

/*Submenu styling*/
ul {
	display: none;
	border: 1px solid black;

	position: absolute;
	left: 0;
	top: 100%;
	margin: 0;
	padding: 0;

	width: max-content;

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
