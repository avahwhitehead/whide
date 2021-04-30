<template>
	<div class="tree-viewer-popup">
		<div class="tab-holder">
			<p class="tab-option" :class="{'active':!show_converted}" @click="show_converted = false">Original</p>
			&nbsp;
			<p class="tab-option" :class="{'active':show_converted}" @click="show_converted = true">Converted</p>
		</div>

		<div class="viewer-body" v-if="show_converted">
			<label class="input-label">
				<input type="text" class="input" v-model="converter_model" placeholder="<any.nil>" />
			</label>
			<div v-if="converterError" v-text="converterError" class="error" />
			<div v-if="treeString"><b>Result:</b> {{ treeString }}</div>
		</div>

		<div class="viewer-body" v-else>
			<label class="input-label">
				<input type="text" class="input" v-model="tree_input" placeholder="<nil.<nil.nil>>" />
			</label>
			<div v-if="treeError" v-text="treeError" class="error" />
		</div>

		<div class="trees">
			<VariableTreeViewer class="tree-viewer" :tree="displayableConvertedTree" :class="{'hidden':!show_converted}" />

			<VariableTreeViewer class="tree-viewer" :tree="displayableBinaryTree" :class="{'hidden':show_converted}" />
		</div>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import { BinaryTree, parseTree } from "@whide/hwhile-wrapper";
import VariableTreeViewer, { TreeType } from "@/components/VariableTreeViewer.vue";
import treeConverter, { ConversionResultType, stringify } from "@whide/tree-lang";
import { binaryTreeToDisplayable, convertedTreeToDisplayable } from "@/utils/tree_converters";

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	cwd: string;
	tree_input : string;
	parsed_tree : BinaryTree;
	converter_model: string;
	treeError?: string;
	converterError?: string;
	show_converted: boolean;
}

export default Vue.extend({
	name: 'PopupTreeViewerBody',
	props: {
		tree: {
			type: String,
			required: true,
		}
	},
	components: {
		VariableTreeViewer,
	},
	data() : DataTypesDescriptor {
		return {
			tree_input: '',
			cwd: '.',
			parsed_tree: {
				left: null,
				right: { left: null, right: null },
			},
			converter_model: 'int',
			treeError: undefined,
			converterError: undefined,
			show_converted: true,
		}
	},
	computed: {
		displayableBinaryTree(): TreeType {
			return binaryTreeToDisplayable(this.parsed_tree);
		},
		convertedTree(): ConversionResultType|undefined {
			//Attempt to convert the tree using the input tree
			return this._runTreeConvert(this.parsed_tree, this.converter_model);
		},
		displayableConvertedTree(): TreeType|undefined {
			//Return the tree as a `TreeType` if it is successful
			if (this.convertedTree) return convertedTreeToDisplayable(this.convertedTree.tree);
			//Return nothing on error
			return this.displayableBinaryTree;
		},
		treeString(): string|undefined {
			if (!this.convertedTree) return undefined;
			return stringify(this.convertedTree.tree);
		}
	},
	watch: {
		tree(tree: string) : void {
			this.tree_input = tree;
		},
		tree_input(): void {
			try {
				this.parsed_tree = parseTree(this.tree_input);
			} catch (e) {
				this.treeError = e;
				return;
			}
			this.treeError = undefined;
		},
	},
	mounted(): void {
		this.tree_input = this.tree;
	},
	methods: {
		/**
		 * Convert a binary tree using the inputted conversion string
		 */
		_runTreeConvert(tree: BinaryTree, converter: string): ConversionResultType | undefined {
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
.tree-viewer-popup {
	display: flex;
	flex-direction: column;
}

.tab-holder {
	text-align: center;
	margin-bottom: 5px;
}
.tab-option {
	color: blue;
	user-select: none;
	margin: 0 auto;
	display: inline-block;
}
.tab-option.active {
	text-decoration: underline;
}
.tab-option:hover {
	text-decoration: underline;
	cursor: pointer;
}

.viewer-body {
	display: flex;
	flex-direction: column;
	flex: 1;
}

.viewer-body .input {
	flex: 1;
}

.input-label {
	display: flex;
	flex-direction: row;
	margin-bottom: 5px;
}

.input-label input[type="text"] {
	flex: 1;
}

.trees {
	display: flex;
	flex-direction: column;
	flex: 1;
	/*TODO: Find a user-intuitive way of resizing the viewer*/
	/*resize: both;*/
	/*overflow: auto;*/
}

.tree-viewer {
	display: flex;
	flex-wrap: wrap;
	flex: 1;
}

.error {
	color: red;
}

.hidden {
	display: none;
}
</style>