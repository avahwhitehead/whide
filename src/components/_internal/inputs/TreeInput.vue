<template>
	<div class="TreeInputElement">
		<div class="viewer-body">
			<label class="input-label">
				<v-text-field class="pa-0 ma-0" v-model="tree_input" placeholder="<nil.<nil.nil>>" />
			</label>

			<div class="output" v-if="treeString"><b>Result:</b> {{ treeString }}</div>

			<div class="error" v-if="treeError" v-text="treeError" />
			<div class="error" v-if="converterError" v-text="converterError" />

			<label class="input-label">
				<v-text-field class="pa-0 ma-0" v-model="converter_model" placeholder="<any.nil>" />
			</label>
		</div>

		<div
			class="expand-button"
			@click="show_trees = !show_trees"
			v-text="`(${show_trees ? 'hide' : 'show'} tree viewer)`"
		/>

		<transition name="fade">
			<VariableTreeViewer class="tree-viewer" :tree="displayableConvertedTree" v-if="show_trees" />
		</transition>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import VariableTreeViewer from "@/components/VariableTreeViewer.vue";
import treeConverter, { BinaryTree, ConversionResultType, stringify, treeParser as parseTree } from "@whide/tree-lang";
import { binaryTreeToDisplayable, convertedTreeToDisplayable } from "@/utils/tree_converters";
import { TreeType } from "@/types/TreeType";

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	tree_input : string;
	parsed_tree : BinaryTree;
	converter_model: string;
	treeError?: string;
	converterError?: string;
	show_trees: boolean;
}

export default Vue.extend({
	name: 'TreeInputElement',
	props: {
		value: {
			type: String,
			required: true,
		}
	},
	components: {
		VariableTreeViewer,
	},
	data() : DataTypesDescriptor {
		return {
			tree_input: 'nil',
			parsed_tree: null,
			converter_model: 'any',
			treeError: undefined,
			converterError: undefined,
			show_trees: true,
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
		value(tree: string) : void {
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
		treeString(val: string) {
			this.$emit('change', val);
		},
	},
	mounted(): void {
		this.tree_input = this.value;
		this.$emit('change', this.value);
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
.input-label {
	margin-bottom: 5px;
}

.output, .error {
	text-align: left;
}
.error {
	color: red;
}

.expand-button {
	text-align: right;
	color: blue;
	text-decoration: underline
}

.tree-viewer {

}

.tree-viewer, .fade-enter-active, .fade-leave-active {
	/*Fixed height*/
	height: 18em;
	/*Don't show the scrollbar when fading*/
	overflow-y: hidden;
}

.fade-enter-active, .fade-leave-active {
	transition: all .2s cubic-bezier(0, 0, 0, 0);
}
.fade-enter, .fade-leave-to {
	transform: scaleY(0) translateZ(0);
	height: 0;
}
</style>
