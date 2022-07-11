<template>
	<v-card class="popup-card pa-2">
		<v-col>
			<v-row>
				<FontAwesomeIcon
					icon="external-link-alt"
					class="icon"
					@click="openTreeInViewer"
				/>

				<v-tabs v-model="currentTab" centered grow style="width: auto;">
					<v-tab>Original</v-tab>
					<v-tab>Converted</v-tab>
				</v-tabs>

				<FontAwesomeIcon
					icon="times-circle"
					class="icon close-icon"
					@click="onCloseClick"
				/>
			</v-row>

			<v-row v-if="show_converted">
				<v-tabs-items v-model="currentTab" class="full-width">
					<v-tab-item>
						<v-text-field v-model="tree_input" placeholder="<nil.<nil.nil>>" />
						<div v-if="treeError" v-text="treeError" class="error--text" />
					</v-tab-item>

					<v-tab-item>
						<v-text-field v-model="converter_model" placeholder="<any.nil>" />
						<div v-if="converterError" v-text="converterError" class="error--text" />
					</v-tab-item>
				</v-tabs-items>
			</v-row>

			<v-row>
				<VariableTreeViewer class="full-width" :tree="currentTree"/>
			</v-row>

			<v-row>
				<div v-if="treeString">
					<b>String:</b> {{ treeString }}
				</div>
			</v-row>

			<v-card-actions class="actions-container pa-0 ma-0">
				<v-spacer />

				<v-btn
					color="blue darken-1"
					text
					@click="onCloseClick"
					v-text="'close'"
				/>

				<v-btn
					color="blue darken-1"
					text
					@click="onSaveClick"
					v-text="'save'"
				/>
			</v-card-actions>
		</v-col>
	</v-card>
</template>


<script lang="ts">
import Vue from "vue";
import VariableTreeViewer from "@/components/VariableTreeViewer.vue";
import { TreeType } from "@/types/TreeType";
import treeConverter, { BinaryTree, ConversionResultType, stringify, treeParser as parseTree } from "@whide/tree-lang";
import { binaryTreeToDisplayable, convertedTreeToDisplayable } from "@/utils/tree_converters";
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

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
	currentTab: number;
}

export default Vue.extend({
	name: 'PopupTreeViewerBody',
	props: {
		tree: {
			type: String,
			required: true,
		},
		value: Boolean,
	},
	components: {
		FontAwesomeIcon,
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
			currentTab: 1,
		}
	},
	computed: {
		currentTree(): TreeType {
			if (this.currentTab === 0) {
				return this.displayableBinaryTree;
			}
			return this.displayableConvertedTree;
		},
		displayableBinaryTree(): TreeType {
			return binaryTreeToDisplayable(this.parsed_tree);
		},
		convertedTree(): ConversionResultType|undefined {
			//Attempt to convert the tree using the input tree
			return this._runTreeConvert(this.parsed_tree, this.converter_model);
		},
		displayableConvertedTree(): TreeType {
			//Return the tree as a `TreeType` if it is successful
			if (this.convertedTree) return convertedTreeToDisplayable(this.convertedTree.tree);
			//Return nothing on error
			return this.displayableBinaryTree;
		},
		treeString(): string|undefined {
			if (!this.convertedTree) return undefined;
			return stringify(this.convertedTree.tree);
		},
		isVisible: {
			get(): boolean {
				return this.value;
			},
			set(val: boolean): void {
				this.$emit('input', val);
			}
		},
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
		openTreeInViewer(): void {
			//Open the tree in a tree viewer in a new window
			let routeData = this.$router.resolve({
				path: '/trees',
				query: {
					t: this.tree_input,
					c: this.converter_model
				}
			});
			window.open(routeData.href, '_blank');
		},
		onCloseClick() {
			this.isVisible = false;
		},
		onSaveClick() {
			this.isVisible = false;
			this.$emit('change', this.treeString, this.converter_model);
		},
	},
});
</script>

<style scoped>
.icon {
	height: 1.25em;
	width: auto;
}
.icon:hover {
	cursor: pointer;
}

.close-icon {
	color: red;
}

.full-width {
	width: 100%;
}
</style>