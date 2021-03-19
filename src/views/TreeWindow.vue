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

/**
 * Choose the starting input tree value, between the URL parameter and a default.
 * @param t				The `t` parameter provided in the URL
 * @param defaultTree	The default to use if the URL does not contain a valid parameter
 */
function chooseInputTree(t: string|(string|null)[], defaultTree: string) : string {
	//Not provided, or is the empty string
	if (!t) return defaultTree;
	//Is provided
	if (typeof t === "string") return t;
	//Is provided multiple times - use the first instance, falling back on the default
	return t.find(e => !!e) || defaultTree;
}

export default Vue.extend({
	name: 'TreeWindow',
	components: {
		VariableInspector,
	},
	data() : DataTypesDescriptor {
		return {
			tree_input: chooseInputTree(this.$route.query.t, "<nil.<nil.nil>>"),
			cwd: '.',
			parsed_tree: {
				left: null,
				right: { left: null, right: null },
			},
		}
	},
	mounted() {
		this.showTree();
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