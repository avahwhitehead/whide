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
				<VariableTreeViewer :tree="tree"></VariableTreeViewer>
			</div>
			<div class="right">
				<VariableTreeViewer :tree="converter_result"></VariableTreeViewer>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import VariableTreeViewer from "@/components/VariableTreeViewer.vue";
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
		converter_result(): ConvertedBinaryTree {
			const res: ConversionResultType = treeConverter(this.tree, this.converter_string);
			return res.tree;
		},
	},
	methods: {
		onConvertClick(): void {
			//Redraw the tree with the new string
			this.converter_string = this.converter_model;
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
