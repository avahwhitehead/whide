<template>
	<svg ref="mysvg" :height="height" />
</template>

<script lang="ts">
import Vue from "vue";
import { ExtendedBinaryTree } from "@whide/whide-types";
import * as d3 from "d3";
import { HierarchyNode } from "d3";
import CircleElement from "@/components/_internal/trees/CircleElement.vue";
import NodeGroup from "@/components/_internal/trees/NodeGroup.vue";
import TextElement from "@/components/_internal/trees/TextElement.vue";
import NodeLink from "@/components/_internal/trees/NodeLink.vue";

export interface TreeType {
	name: any;
	children?: TreeType[];
}

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
		convertedTree() : TreeType {
			return _convertTree(this.tree);
		},
		diagramWidth() : number {
			return this.width - this.margin.left - this.margin.right;
		},
		diagramHeight() : number {
			return this.height - this.margin.top - this.margin.bottom;
		},
	},
	methods: {
		_interpretTree(tree: ExtendedBinaryTree) : HierarchyNode<any> {
			let t = _convertTree(tree);

			// set the dimensions and margins of the diagram
			let treemap = d3.tree().size([this.diagramWidth, this.diagramHeight]);
			// assigns the data to a hierarchy using parent-child relationships
			let nodes : HierarchyNode<any> = d3.hierarchy(t);
			// maps the node data to the tree layout
			return treemap(nodes);
		},

		/**
		 * Draw the tree as an SVG diagram.
		 * Based on this example: https://bl.ocks.org/d3noob/72f43406bbe9e104e957f44713b8413c
		 * @param treeData
		 */
		drawTree(treeData: ExtendedBinaryTree) {
			let nodes = this._interpretTree(treeData);

			//Get the SVG element
			const svg = d3.select(this.$refs["mysvg"] as Element);
			//Remove the old diagram
			svg.selectChildren().remove();

			//Make the root group element
			let g = svg.append("g");
			g.attr("transform", `translate(${this.margin.left},${this.margin.top})`);

			//Draw the links between the nodes
			const links = g.selectAll(".link");
			links.data(nodes.descendants().slice(1))
				.enter().append((d: any) => {
					return new NodeLink({
						propsData: {
							d
						}
					}).$mount().$el;
				});

			//Add each node
			let nodeGroups = g.selectAll(".node").data(nodes.descendants())
				.enter().append((d: any) => {
					return new NodeGroup({
						propsData: {
							d
						}
					}).$mount().$el;
				});

			//Add a circle to each node
			nodeGroups.append(() => {
				return new CircleElement({
					propsData: {
						radius: 10,
					}
				}).$mount().$el;
			});

			//Add the text to each node
			nodeGroups.append((d: any) => {
				return new TextElement({
					propsData: {
						d,
					}
				}).$mount().$el;
			});
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
