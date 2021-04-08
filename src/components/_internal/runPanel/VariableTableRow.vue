<template>
	<tr class="VariableTableRow">
		<td class="name-cell" v-text="name" />
		<td class="val-cell" :class="{'error': tree_error}" :title="treeString" v-text="computedVal" @click="onClick" />
		<td class="select-cell">
			<label>
				<input v-model="conversion_string" />
			</label>
		</td>
	</tr>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { BinaryTree } from "@whide/hwhile-wrapper";
import runConvert, { ConversionResultType, ConvertedBinaryTree, stringify } from "@whide/tree-lang";

function extendedTreeAsString(tree: BinaryTree) : string {
	if (!tree) return 'nil';
	const left = extendedTreeAsString(tree.left);
	const right = extendedTreeAsString(tree.right);
	return `<${left}.${right}>`;
}

interface DataTypeDescriptor {
	conversion_string: string;
	converted_tree: ConvertedBinaryTree|undefined;
	tree_error: boolean;
	computedVal: string;
	treeString: string;
}

export default Vue.extend({
	name: 'VariableTableRow',
	props: {
		name: {
			type: String,
		},
		value: {
			type: Object as PropType<BinaryTree>,
			default: null,
		},
	},
	data(): DataTypeDescriptor {
		return {
			computedVal: '',
			conversion_string: 'any',
			converted_tree: undefined,
			tree_error: false,
			treeString: 'nil',
		};
	},
	methods: {
		run_convert(tree: BinaryTree, converter: string) {
			let res: ConversionResultType;
			try {
				res = runConvert(tree, converter);
				this.tree_error = res.error;
				this.computedVal = stringify(res.tree);
			} catch (e) {
				this.tree_error = true;
				this.computedVal = 'Syntax Error';
			}
			this.treeString = extendedTreeAsString(tree);
		},
		onClick() {
			let routeData = this.$router.resolve({ path: '/trees', query: { t:this.treeString } });
			window.open(routeData.href, '_blank');
		},
	},
	watch: {
		value(newVal: BinaryTree) {
			this.run_convert(newVal, this.conversion_string);
		},
		conversion_string(conversion_string: string) {
			this.run_convert(this.value, conversion_string);
		},
	},
	mounted() {
		this.run_convert(this.value, this.conversion_string);
	},
})
</script>


<style scoped>
.VariableTableRow {

}
.VariableTableRow td {
	text-align: center;
	min-width: 4em;
}
.VariableTableRow .name-cell {

}
.VariableTableRow .val-cell {
	white-space: nowrap;
	overflow: hidden;
	text-overflow: ellipsis;
	max-width: 15em;
}
.VariableTableRow .val-cell.error {
	color: red;
}
.VariableTableRow .val-cell:hover {
	text-decoration: underline;
}
.VariableTableRow .select-cell {

}
</style>
