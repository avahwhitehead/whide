<template>
	<svg ref="mysvg" :height="height" />
</template>

<script lang="ts">
import Vue from "vue";
import { ExtendedBinaryTree } from "@whide/whide-types";
import * as d3 from "d3";
import { HierarchyPointNode } from "d3";
import NodeGroup from "@/components/_internal/trees/NodeGroup.vue";

export interface TreeType {
	name: any;
	children?: TreeType[];
}

/**
 * Convert a binary tree into d3's more general tree format
 * @param tree	The binary tree in the external format
 * @returns The {@code tree} represented in d3's tree format
 */
function _convertTree(tree: ExtendedBinaryTree|string) : TreeType {
	if (tree === null) return { name: 'nil' };
	if (typeof tree === "string") return { name: tree };
	return {
		name: '',
		children: [
			_convertTree(tree.left),
			_convertTree(tree.right)
		],
	};
}

interface DataTypeInterface {
	margin: {
		top: number,
		right: number,
		bottom: number,
		left: number
	},
	width: number;
	height: number;
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
		return {
			margin: {
				left: 20,
				right: 20,
				top: 40,
				bottom: 50,
			},
			width: 660,
			height: 500,
		};
	},
	computed: {
		diagramWidth() : number {
			return this.width - this.margin.left - this.margin.right;
		},
		diagramHeight() : number {
			return this.height - this.margin.top - this.margin.bottom;
		},
	},
	methods: {
		/**
		 * Draw the tree as an SVG diagram.
		 * Based on this example: https://bl.ocks.org/d3noob/72f43406bbe9e104e957f44713b8413c
		 * @param treeData
		 */
		drawTree(treeData: ExtendedBinaryTree) {
			//Tell d3 to work with a tree, and stay in the diagram limits
			let treemap = d3.tree().size([this.diagramWidth, this.diagramHeight]);

			//Convert the tree from the external representation into the form accepted by d3
			let converted : TreeType = _convertTree(treeData);
			//Use the parent-child hierarchy to build the tree
			let nodes: HierarchyPointNode<unknown> = treemap(d3.hierarchy(converted));

			//Get the SVG element, and remove any existing child nodes
			const svg = d3.select(this.$refs["mysvg"] as Element);
			svg.selectChildren().remove();

			//SVG root group element
			let root = svg.append("g");
			//Apply the padding
			root.attr("transform", `translate(${this.margin.left},${this.margin.top})`);

			//For each node in the tree...
			root.selectAll(".node").data(nodes.descendants()).enter()
				//Add a NodeGroup element
				.append((d: any) => new NodeGroup({propsData: {d}}).$mount().$el);
		}
	},
	mounted() {
		this.drawTree(this.tree);
	},
	watch: {
		tree(newTree: ExtendedBinaryTree) {
			this.drawTree(newTree);
		}
	}
});
</script>


<style scoped>
svg {
	width: 100%;
}
</style>
