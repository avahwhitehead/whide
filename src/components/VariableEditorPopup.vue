<template>
	<v-dialog
		v-model="showDialog"
		persistent
		scrollable
		max-width="700px"
	>
		<v-card class="pa-2 pr-0">
			<v-container style="display: flex" class="pa-0">
				<div class="text-h5">Edit Variable: '{{name}}'</div>
				<v-spacer/>
				<FontAwesomeIcon icon="times-circle" class="icon-close" @click="onCloseClick" />
			</v-container>

			<v-divider />

			<v-card-text class="pl-0 pr-0">
				<v-form ref="form">
					<v-col>
						<v-row dense>
							<div style="text-align: left">
								<div>Original Value:</div>
								<div class="font-weight-bold" v-text="originalTree" />
							</div>
						</v-row>

						<v-row dense>
							<v-btn @click="resetInputs">Reset Value</v-btn>
						</v-row>

						<v-row dense>
							<v-text-field
								label="New Value"
								v-model="treeInput"
								:rules="[
									notEmptyRule,
									() => treeError ? treeError : true,
								]"
							/>
						</v-row>

						<v-row dense>
							<v-text-field
								label="Display format"
								v-model="conversionString"
								:rules="[
									notEmptyRule,
									() => converterError ? converterError : true,
								]"
							/>
						</v-row>

						<v-row dense>
							<div
								class="expand-button"
								@click="show_tree_viewer = !show_tree_viewer"
								v-text="`(${show_tree_viewer ? 'hide tree view' : 'show as tree'})`"
							/>
						</v-row>

						<v-row dense>
							<transition name="fade">
								<VariableTreeViewer class="tree-viewer" :tree="displayableConvertedTree" v-if="show_tree_viewer" />
							</transition>
						</v-row>
					</v-col>
				</v-form>
			</v-card-text>

			<v-card-actions>
				<v-spacer />

				<v-btn color="blue darken-1" text @click="onCloseClick()">Cancel</v-btn>
				<v-btn color="blue darken-1" text @click="onSaveClick()">Apply</v-btn>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import treeConverter, { BinaryTree, ConversionResultType, stringify, treeParser } from "@whide/tree-lang";
import VariableTreeViewer, { TreeType } from "@/components/VariableTreeViewer.vue";
import { binaryTreeToDisplayable, convertedTreeToDisplayable } from "@/utils/tree_converters";

interface DataTypeInterface {
	treeInput: string;
	show_tree_viewer: boolean;

	parsedTree : BinaryTree;
	conversionString: string;
	treeError?: string;
	converterError?: string;
}

export default Vue.extend({
	name: 'VariableEditorPopup',
	components: {
		VariableTreeViewer,
	},
	props: {
		value: Boolean,
		name: String,
		format: {
			type: String,
			required: false,
			default: 'any',
		},
		tree: Object as PropType<BinaryTree>,
	},
	data() : DataTypeInterface {
		return {
			treeInput: '',
			conversionString: 'any',
			show_tree_viewer: true,
			parsedTree: null,
			treeError: undefined,
			converterError: undefined,
		}
	},
	computed: {
		/**
		 * Wrapper around v-model to show/hide the dialog
		 */
		showDialog: {
			get(): boolean {
				return this.value;
			},
			set(value: boolean): void {
				this.$emit('input', value);
			},
		},
		/**
		 * Display the original tree (the current variable value) as a string
		 */
		originalTree(): string {
			let convertedTree: ConversionResultType|undefined = this._runTreeConvert(this.tree, this.format);
			if (!convertedTree) return 'undefined2';
			return stringify(convertedTree.tree);
		},
		/**
		 * Convert the input tree from a pure binary tree to a converted (human-readable) tree
		 */
		convertedInputTree(): ConversionResultType|undefined {
			//Attempt to convert the tree using the input tree
			return this._runTreeConvert(this.parsedTree, this.conversionString);
		},
		/**
		 * Convert the "converted" binary tree to a format that can be displayed by the viewer
		 */
		displayableConvertedTree(): TreeType|undefined {
			//Return the tree as a `TreeType` if it is successful
			if (this.convertedInputTree) {
				return convertedTreeToDisplayable(this.convertedInputTree.tree);
			}
			//Return nothing on error
			return binaryTreeToDisplayable(this.parsedTree);
		},
	},
	mounted() {

	},
	methods: {
		onCloseClick(): void {
			//TODO: Confirm no save
			this.showDialog = false;
		},
		onSaveClick(): void {
			this.$emit('change', this.parsedTree, this.conversionString);
		},
		resetInputs(): void {
			this.treeInput = this.originalTree;
			this.conversionString = this.format;
		},
		resetForm(): void {
			this.resetInputs();
		},
		/**
		 * Convert a binary tree using the inputted conversion string
		 */
		_runTreeConvert(tree: BinaryTree, converter: string): ConversionResultType | undefined {
			let res: ConversionResultType;
			try {
				//Attempt to run the conversion
				res = treeConverter(tree, converter);
			} catch (e: any) {
				//Display any errors
				this.converterError = (e as Error).message;
				return;
			}
			//Clear any errors
			this.converterError = undefined;
			//Return the result
			return res;
		},
		notEmptyRule(val: string): boolean|string {
			return val.replaceAll(/\s+/g, '') !== '' || "Enter a value";
		},
	},
	watch: {
		showDialog(visible: boolean) {
			if (!visible) this.treeInput = '';
			else this.resetForm();
		},
		treeInput(): void {
			try {
				this.parsedTree = treeParser(this.treeInput);
			} catch (e) {
				this.treeError = (e as Error).message;
				return;
			}
			this.treeError = undefined;
		},
		treeError() {
			(this.$refs.form! as Vue & { validate: () => void }).validate();
		},
		converterError() {
			(this.$refs.form! as Vue & { validate: () => void }).validate();
		},
	},
});
</script>


<style scoped>
.icon-close {
	color: red;
	height: 1.5em;
	width: auto;
}
.icon-close:hover {
	cursor: pointer;
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
	/*height: 18em;*/
	width: 100%;
	/*Don't show the scrollbar when fading*/
	/*overflow-y: hidden;*/
}

.fade-enter-active, .fade-leave-active {
	transition: all .2s cubic-bezier(0, 0, 0, 0);
}
.fade-enter, .fade-leave-to {
	transform: scaleY(0) translateZ(0);
	/*height: 0;*/
}
</style>
