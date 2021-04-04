<template>
	<div class="VariableInspector">
		<div class="select">
			<label>
				<input v-model="converter_model" />
				<button @click="onConvertClick">Show</button>
			</label>
		</div>

		<div class="inspector">
			<div class="left">
				<VariableTreeViewer :tree="binaryTree"></VariableTreeViewer>
			</div>
			<div class="right">
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
		}
	},
	computed: {
		binaryTree(): TreeType {
			return this._convertBinaryTree(this.tree);
		},
		convertedTree(): TreeType {
			const res: ConversionResultType = treeConverter(this.tree, this.converter_string);
			return this._convertConvertedTree(res.tree)
		},
	},
	methods: {
		onConvertClick(): void {
			//Redraw the tree with the new string
			this.converter_string = this.converter_model;
		},
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
	border: 1px solid black;
	min-height: 8em;
}

.VariableInspector .inspector .left {
	float: left;
}
.VariableInspector .inspector .right {
	float: right;
}
</style>
