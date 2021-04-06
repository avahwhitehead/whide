<template>
	<div class="VariableInspector">
		<div class="converter-container">
			<label>
				<input v-model="converter_model" placeholder="<any.<any.nil>>>" />
				<button @click="onConvertClick">Show</button>
			</label>
			<p v-if="error" v-text="error" class="error" />
		</div>

		<div class="inspector">
			<div class="left">
				<p>Original:</p>
				<VariableTreeViewer :tree="binaryTree"></VariableTreeViewer>
			</div>
			<div class="right">
				<p>Converted:</p>
				<VariableTreeViewer :tree="convertedTree"></VariableTreeViewer>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import VariableTreeViewer, { TreeType } from "@/components/VariableTreeViewer.vue";
import { BinaryTree } from "@whide/hwhile-wrapper";
import treeConverter, { ConversionResultType, ConvertedBinaryTree } from "@whide/tree-lang";

interface DataTypeDescriptor {
	selectedConverter: number;
	converter_model: string;
	converter_string: string;
	error?: string;
}

export default Vue.extend({
	name: 'VariableInspector',
	components: {
		VariableTreeViewer
	},
	props: {
		tree: {
			type: Object as PropType<BinaryTree>,
			default: null,
		},
	},
	data(): DataTypeDescriptor {
		return {
			selectedConverter: 0,
			converter_model: 'int',
			converter_string: 'int',
			error: undefined,
		}
	},
	computed: {
		binaryTree(): TreeType {
			return this._convertBinaryTree(this.tree);
		},
		convertedTree(): TreeType|undefined {
			//Attempt to convert the tree using the input string
			let res: ConversionResultType|undefined = this._runTreeConvert(this.tree, this.converter_string);
			//Return the tree as a `TreeType` if it is successful
			if (res) return this._convertConvertedTree(res.tree);
			//Return nothing on error
			return this.binaryTree;
		},
	},
	methods: {
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
				this.error = e;
				return;
			}
			//Clear any errors
			this.error = undefined;
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
	}
})
</script>


<style scoped>
.VariableInspector .inspector {

}

.VariableInspector .inspector .left, .inspector .right {
	display: inline-block;
	width: calc(50% - 2px);
	min-height: 8em;
}

.VariableInspector .inspector .left {
	float: left;
}
.VariableInspector .inspector .right {
	float: right;
}

.error {
	color: red;
}
</style>
