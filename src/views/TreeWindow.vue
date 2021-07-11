<template>
	<v-container fluid class="tree-window">
		<v-row class="tree-viewer-row pb-0">
			<v-col cols="1">
				<v-btn v-if="!focusRight" @click="focusLeft=!focusLeft" style="float: left">
					<FontAwesomeIcon :icon="focusLeft?'columns':'expand-arrows-alt'"></FontAwesomeIcon>
				</v-btn>
			</v-col>
			<v-col>
				<span class="text-h5" style="text-align: center">Binary Tree:</span>
			</v-col>

			<v-col class="pb-0" cols="2" />

			<v-col>
				<span class="text-h5" style="text-align: center">Conversion Type:</span>
			</v-col>
			<v-col cols="1">
				<v-btn v-if="!focusLeft" @click="focusRight=!focusRight" style="float: right">
					<FontAwesomeIcon :icon="focusRight?'columns':'expand-arrows-alt'"></FontAwesomeIcon>
				</v-btn>
			</v-col>
		</v-row>

		<v-row class="tree-viewer-row mt-0">
			<v-col class="pt-0 pb-0">
				<v-text-field class="input-box pa-0" type="text" v-model="tree_input" placeholder="<nil.<nil.nil>>" @keypress.enter="onConvertClick" />
				<p v-if="treeError" v-text="treeError" class="error" />
			</v-col>

			<v-col class="pa-0" cols="2">
				<v-btn @click="onConvertClick">Display</v-btn>
			</v-col>

			<v-col class="pt-0 pb-0">
				<v-text-field class="input-box pa-0" type="text" v-model="converter_model" placeholder="<any.nil>>" @keypress.enter="onConvertClick" />
				<p v-if="converterError" v-text="converterError" class="error" />
			</v-col>
		</v-row>

		<v-row class="tree-viewer-row viewer-row mt-0">
			<v-col v-if="!focusRight" class="panel">
				<VariableTreeViewer class="tree-viewer" :tree="binaryTree" />
			</v-col>

			<v-col v-if="!focusLeft" class="panel">
				<VariableTreeViewer class="tree-viewer" :tree="convertedTree" />
			</v-col>
		</v-row>
	</v-container>
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
	focusLeft: boolean;
	focusRight: boolean;
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
			focusLeft: false,
			focusRight: false,
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
	max-width: 100vw;
	max-height: 100vh;
	height: 100%;
	display: flex;
	flex-direction: column;
	flex: 1;
}

.tree-viewer-row {
	flex-grow: 0;
}

.tree-viewer-row.viewer-row {
	display: flex;
	flex-direction: row;
	min-height: 0;
	flex: 1;
}

.panel {
	display: flex;
	flex-direction: column;
	min-height: 0;
	flex: 1;
	height: 100%;
}

.tree-viewer {
	height: 100%;
	flex: 1;
}

.maximize-button.right {
	text-align: right;
}
.maximize-button.left {
	text-align: left;
}
</style>