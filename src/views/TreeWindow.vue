<template>
	<div class="tree-window">
		<div class="left">
			<p class="caption">Original:</p>
			<label class="input-label">
				<input type="text" v-model="tree_input" placeholder="<nil.<nil.nil>>" />
				<button @click="onConvertClick">Convert</button>
			</label>
			<p v-if="treeError" v-text="treeError" class="error" />
			<VariableTreeViewer class="tree-viewer" :tree="binaryTree" />
		</div>

		<div class="right">
			<p class="caption">Converted:</p>
			<label class="input-label">
				<input type="text" v-model="converter_model" placeholder="<any.nil>>" />
				<button @click="onConvertClick">Convert</button>
			</label>
			<p v-if="converterError" v-text="converterError" class="error" />
			<VariableTreeViewer class="tree-viewer" :tree="convertedTree" />
		</div>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import VariableTreeViewer, { TreeType } from "@/components/VariableTreeViewer.vue";
import treeConverter, { ConversionResultType, BinaryTree, treeParser as parseTree } from "@whide/tree-lang";
import { binaryTreeToDisplayable, convertedTreeToDisplayable } from "@/utils/tree_converters";

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	cwd: string;
	tree_input : string;
	parsed_tree : BinaryTree;
	converter_model: string;
	converter_string: string;
	treeError?: string;
	converterError?: string;
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
		VariableTreeViewer,
	},
	data() : DataTypesDescriptor {
		return {
			tree_input: chooseInputTree(this.$route.query.t, "<nil.<nil.nil>>"),
			cwd: '.',
			parsed_tree: {
				left: null,
				right: { left: null, right: null },
			},
			converter_model: chooseInputTree(this.$route.query.c, 'int'),
			converter_string: chooseInputTree(this.$route.query.c, 'int'),
			treeError: undefined,
			converterError: undefined,
		}
	},
	computed: {
		binaryTree(): TreeType {
			return binaryTreeToDisplayable(this.parsed_tree);
		},
		convertedTree(): TreeType|undefined {
			//Attempt to convert the tree using the input string
			let res: ConversionResultType|undefined = this._runTreeConvert(this.parsed_tree, this.converter_string);
			//Return the tree as a `TreeType` if it is successful
			if (res) return convertedTreeToDisplayable(res.tree)
			//Return nothing on error
			return this.binaryTree;
		},
	},
	mounted() {
		this.onConvertClick();
	},
	methods: {
		onConvertClick(): void {
			try {
				this.parsed_tree = parseTree(this.tree_input);
			} catch (e) {
				this.treeError = e;
				return;
			}
			this.treeError = undefined;
			//Redraw the tree with the new string
			this.converter_string = this.converter_model;
		},

		/**
		 * Convert a binary tree using the inputted conversion string
		 */
		_runTreeConvert(tree: BinaryTree, converter: string): ConversionResultType|undefined {
			let res: ConversionResultType;
			try {
				//Attempt to run the conversion
				res = treeConverter(tree, converter);
			} catch (e) {
				//Display any errors
				this.converterError = e;
				return;
			}
			//Clear any errors
			this.converterError = undefined;
			//Return the result
			return res;
		},
	},
});
</script>

<style scoped>
.tree-window {
	width: 100%;
	display: flex;
	flex-direction: row;
}

.left, .right {
	flex: 1;
	display: inline-block;
	margin: 0 20px;
}

.caption {
	margin-top: 5px;
	margin-bottom: 5px;
}

.input-label {
	display: flex;
	flex-direction: row;
	margin-bottom: 5px;
}

.input-label input[type="text"] {
	flex: 1;
}

.tree-viewer {
	flex: 1;
}

.error {
	color: red;
}
</style>