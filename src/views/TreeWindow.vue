<template>
	<div class="tree-window">
		<div>
			<input v-model="tree_input"/>
			<button @click="showTree">Submit</button>
		</div>
		<div>
			<VariableInspector :tree="parsed_tree" />
		</div>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import VariableInspector from "@/components/VariableInspector.vue";
import { BinaryTree, parseTree } from "@whide/hwhile-wrapper";

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	cwd: string;
	tree_input : string;
	parsed_tree : BinaryTree;
}

export default Vue.extend({
	name: 'TreeWindow',
	components: {
		VariableInspector,
	},
	data() : DataTypesDescriptor {
		return {
			tree_input: "<nil.<nil.nil>>",
			cwd: '.',
			parsed_tree: {
				left: null,
				right: { left: null, right: null },
			},
		}
	},
	computed: {

	},
	methods: {
		showTree() : void {
			this.parsed_tree = parseTree(this.tree_input);
		},
	},
});
</script>

<style scoped>

</style>