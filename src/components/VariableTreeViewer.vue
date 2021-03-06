<template>
	<div class="treeNode">
		<span v-if="!tree">nil</span>
		<span v-else-if="typeof tree === 'string'">{{ tree }}</span>
		<div v-else class="children-holder">
			<div>.</div>
			<div class="children">
				<div class="child left">
					<VariableTreeViewer :tree="tree.left"></VariableTreeViewer>
				</div>
				<div class="child right">
					<VariableTreeViewer :tree="tree.right"></VariableTreeViewer>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { ExtendedBinaryTree } from "@whide/whide-types";

interface DataTypeInterface {

}

export default Vue.extend({
	name: 'VariableTreeViewer',
	props: {
		tree: [
			Object as () => ExtendedBinaryTree,
			String,
		],
	},
	data() : DataTypeInterface {
		return {};
	},
});
</script>


<style scoped>
.treeNode {
	margin-left: .5em;
	margin-right: .5em;
}

.treeNode .children-holder {
	text-align: center;
}

.treeNode .children {
	border-top: 1px dotted black;
	display: inline-block;
	vertical-align: top;
	width: 100%;
	text-align: center;
}

.treeNode .children .child {
	vertical-align: top;
	display: inline-block;
	width: initial;
}

.treeNode .children .child.left {
	text-align: left;
	float: left;
}

.treeNode .children .child.right {
	text-align: right;
	float: right;
}
</style>
