<!--
Stylings based on this example:
https://csslayout.io/patterns/nested-dropdowns/
-->

<template>
	<ul class="MenuBar">
		<MenuElement
			v-for="(menu, i) in menus" :key="i"
			:menu="menu"
			@click="onClick"
		/>

		<InputPrompt @controller="onController" />
	</ul>
</template>

<script lang="ts">
import Vue from "vue";
import { IOController, Menu, MenuItem } from "@/types";
import MenuElement from "./_internal/menubar/MenuElement.vue";
import InputPrompt from "@/components/InputPrompt.vue";
import { CustomDict } from "@/types/CustomDict";

interface DataTypeInterface {
	selectedTab: number;
	ioController: IOController|undefined;
}

export default Vue.extend({
	name: 'MenuBar',
	components: {
		InputPrompt,
		MenuElement,
	},
	props: {
		menus: {
			type: Array as () => Array<Menu>,
			default: () => [],
		},
	},
	data() : DataTypeInterface {
		return {
			selectedTab: 0,
			ioController: undefined,
		}
	},
	methods: {
		async onClick(item: MenuItem): Promise<void> {
			//Don't do anything if the item doesn't have a command to run
			if (!item.command) return;

			if (!this.ioController) {
				throw new Error("Couldn't get IO Controller");
			}

			let args: CustomDict<string> = {};
			for (let arg of (item.args || [])) {
				//Prompt the user for the argument input
				let val = await this.ioController!.getInput({
					title: arg.name,
					message: arg.description || "",
					type: arg.type || 'string',
					//Validate the input
					validator: arg.validator,
				});
				//End here if the user presses cancel
				if (val === undefined) return;
				//Otherwise store the value
				args[arg.name] = val;
			}
			//Run the command
			item.command({
				args
			});
		},
		onController(c: IOController): void {
			this.ioController = c;
		}
	}
});
</script>

<style scoped>
.MenuBar {
	border: 1px solid black;
	margin: 0;
	padding: 0;
}
</style>
