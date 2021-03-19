<template>
	<div class="VariableTable">
		<table>
			<tr>
				<th>Name</th>
				<th>Value</th>
				<th>Type</th>
				<th></th>
			</tr>
			<VariableTableRow
				:name="v.name" :value="v.value"
				v-for="(v,i) of variables" :key="i"
			/>
		</table>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { pluginManager } from "@/utils/globals";
import { TreeConverter } from "@whide/whide-types";
import VariableTableRow from "@/components/_internal/runPanel/VariableTableRow.vue";
import { BinaryTree } from "@whide/hwhile-wrapper";

interface DataTypeDescriptor {

}

export default Vue.extend({
	name: 'VariableTable',
	components: {
		VariableTableRow,
	},
	props: {
		variables: {
			type: Array as () => Array<{ name: string, value: BinaryTree }>,
			required: true,
		}
	},
	data(): DataTypeDescriptor {
		return {};
	},
	computed: {
		converters() : TreeConverter[] {
			return pluginManager.treeConverterManager.converters;
		}
	},
})
</script>


<style scoped>
.VariableTable {
	float: right;
}
.VariableTable th {
	text-align: center;
}
</style>
