<template>
	<div class="tree-window">
		<div class="left">
			<p class="caption">Original:</p>
			<label class="input-label">
				<input type="text" v-model="tree_input" placeholder="<nil.<nil.nil>>" />
				<button @click="showTree">Convert</button>
			</label>
			<p v-if="treeError" v-text="treeError" class="error" />
			<VariableTreeViewer class="tree-viewer" :tree="binaryTree" />
		</div>

		<div class="right">
			<p class="caption">Converted:</p>
			<label class="input-label">
				<input type="text" v-model="converter_model" placeholder="<any.nil>>" />
				<button @click="showTree">Convert</button>
			</label>
			<p v-if="converterError" v-text="converterError" class="error" />
			<VariableTreeViewer class="tree-viewer" :tree="convertedTree" />
		</div>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import { BinaryTree, parseTree } from "@whide/hwhile-wrapper";
import VariableTreeViewer, { TreeType } from "@/components/VariableTreeViewer.vue";
import treeConverter, { ConversionResultType, ConvertedBinaryTree } from "@whide/tree-lang";

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
			converter_model: 'int',
			converter_string: 'int',
			treeError: undefined,
			converterError: undefined,
		}
	},
	computed: {
		binaryTree(): TreeType {
			return this._convertBinaryTree(this.parsed_tree);
		},
		convertedTree(): TreeType|undefined {
			//Attempt to convert the tree using the input string
			let res: ConversionResultType|undefined = this._runTreeConvert(this.parsed_tree, this.converter_string);
			//Return the tree as a `TreeType` if it is successful
			if (res) return this._convertConvertedTree(res.tree);
			//Return nothing on error
			return this.binaryTree;
		},
	},
	mounted() {
		this.showTree();
	},
	methods: {
		showTree() : void {
			try {
				this.parsed_tree = parseTree(this.tree_input);
				this.treeError = undefined;
			} catch (e) {
				this.treeError = e;
			}
		},

		onConvertClick(): void {
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

		/**
		 * Change a BinaryTree object to the TreeType
		 * @param binary	The binary tree to convert
		 */
		_convertBinaryTree(binary: BinaryTree) : TreeType {
			//Display 'null' nodes as 'nil'
			if (binary === null) {
				return { name: 'nil', children: [], };
			}
			//Add the children
			let children: TreeType[] = [
				this._convertBinaryTree(binary.left),
				this._convertBinaryTree(binary.right),
			];
			//Return the created node
			return {
				name: '',
				children,
			};
		},

		/**
		 * Change a ConvertedBinaryTree object to the TreeType
		 * @param conv		The ConvertedBinaryTree
		 * @param error		(INTERNAL) Whether to display this subtree as an error
		 * @param list		(INTERNAL) Whether to display this subtree as a list
		 */
		_convertConvertedTree(conv: ConvertedBinaryTree, error = false, list = false) : TreeType {
			//Label the node 'nil' if it is null, or use its value
			let name: string|number = '';
			if (conv.value === null) name = 'nil';
			else if (conv.value !== undefined) name = conv.value;

			const isErrored = error || !!conv.error;
			const isList = list || !!conv.list;

			//Add the children
			let children: TreeType[] = [];
			for (let child of (conv.children || [])) {
				children.push(this._convertConvertedTree(child, isErrored, isList));
			}
			//Return the created node
			return {
				name: name,
				list: isList,
				errorMsg: conv.error,
				error: isErrored,
				children,
			};
		}
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