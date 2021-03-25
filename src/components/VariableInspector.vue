<template>
	<div class="VariableInspector">
		<div class="select">
			<label>
				<select v-model="selectedConverter">
					<option v-for="(opt, i) of treeConverterManager.converters" :key="i" :value="i">{{ opt.name }}</option>
				</select>
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
import { TreeConverterManager } from "@/api/managers/TreeConverterManager";
import { BinaryTree } from "@whide/hwhile-wrapper";
import { ExtendedBinaryTree, TreeConverter } from "@whide/whide-types/";
import { pluginManager } from "@/utils/globals";

interface DataTypeDescriptor {
	selectedConverter: number;
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
		}
	},
	computed: {
		converter_result() :ExtendedBinaryTree {
			const treeConverter: TreeConverter = this.treeConverterManager.converters[this.selectedConverter];
			if (treeConverter) return treeConverter.convert(this.tree);
			return null;
		},
		treeConverterManager() : TreeConverterManager {
			return pluginManager.treeConverterManager;
		}
	},
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
