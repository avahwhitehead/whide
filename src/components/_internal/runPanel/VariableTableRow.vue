<template>
	<tr class="VariableTableRow">
		<td class="name-cell" v-text="name" />
		<td class="val-cell" :title="treeString" v-text="computedVal" @click="onClick" />
		<td class="select-cell">
			<label>
				<select v-model="selectModel">
					<option v-for="(c,i) of converters" :key="i" :value="i">{{ c.name }}</option>
				</select>
			</label>
		</td>
	</tr>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { pluginManager } from "@/utils/globals";
import { ExtendedBinaryTree, TreeConverter } from "@whide/whide-types";
import { BinaryTree } from "@whide/hwhile-wrapper";

function extendedTreeAsString(tree: ExtendedBinaryTree) : string {
	if (!tree) return 'nil';
	if (typeof tree === 'string') return tree;

	const left = extendedTreeAsString(tree.left);
	const right = extendedTreeAsString(tree.right);
	return `<${left}.${right}>`;
}

interface DataTypeDescriptor {
	selectModel: 0;
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
			selectModel: 0,
			computedVal: 'nil',
			treeString: 'nil',
		};
	},
	computed: {
		converters() : TreeConverter[] {
			return pluginManager.treeConverterManager.converters;
		},
		treeConverter() : TreeConverter {
			return this.converters[this.selectModel];
		}
	},
	methods: {
		run_convert(value: BinaryTree, treeConverter?: TreeConverter) {
			let tree: ExtendedBinaryTree;
			if (treeConverter) tree = treeConverter.convert(value);
			else tree = value;
			this.computedVal = extendedTreeAsString(tree);
			this.treeString = extendedTreeAsString(value);
		},
		onClick() {
			window.open('/trees?t=' + this.treeString, '_blank', "height=400");
		},
	},
	watch: {
		treeConverter(converter: TreeConverter) {
			this.run_convert(this.value, converter);
		},
		value(newVal: BinaryTree) {
			this.run_convert(newVal, this.treeConverter);
		},
	},
	mounted() {
		this.run_convert(this.value, this.treeConverter);
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
.VariableTableRow .val-cell:hover {
	text-decoration: underline;
}
.VariableTableRow .select-cell {

}
</style>
