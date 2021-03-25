<template>
	<div class="container">
		<svg id="mysvg" :width="width" :height="height" />
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { ExtendedBinaryTree } from "@whide/whide-types";
import * as d3 from "d3";
import { HierarchyNode } from "d3";

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
	components: {

	},
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
		/**
		 * Draw the tree as an SVG diagram.
		 * Based on this example: https://bl.ocks.org/d3noob/72f43406bbe9e104e957f44713b8413c
		 * @param treeData
		 */
		drawTree(treeData: TreeType) {
			// set the dimensions and margins of the diagram
			let width = this.diagramWidth;
			let height = this.diagramHeight;

			// declares a tree layout and assigns the size
			let treemap = d3.tree().size([width, height]);

			//  assigns the data to a hierarchy using parent-child relationships
			let nodes : HierarchyNode<any> = d3.hierarchy(treeData);
			// maps the node data to the tree layout
			nodes = treemap(nodes);

			// append the svg object to the body of the page
			const svg = d3.select("#mysvg");
			svg.selectChildren().remove();

			//Root group element
			let g = svg.append("g");
			g.attr("transform", `translate(${this.margin.left},${this.margin.top})`);

			//The links between the nodes
			const links = g.selectAll(".link");
			// eslint-disable-next-line @typescript-eslint/no-unused-vars
			let link = links.data(nodes.descendants().slice(1)).enter()
				.append("path")
					.attr("class", "link")
					.attr("d", function(d: any) {
						let path = `M${d.x},${d.y}`;
						path += `C${d.x},${(d.y + d.parent.y) / 2}`;
						path += ` ${d.parent.x},${(d.y + d.parent.y) / 2}`;
						path += ` ${d.parent.x},${d.parent.y}`;
						return path;
					});

			// adds each node as a group
			let node = g.selectAll(".node")
				.data(nodes.descendants())
				.enter().append("g")
				.attr("class", (d: any) => `node ${d.children ? 'node--internal' : 'node--leaf'}`)
				.attr("transform", (d: any) => `translate(${d.x},${d.y})`);

			// adds the circle to the node
			node.append("circle")
				.attr("r", 10)
				.attr('onclick', 'console.log("clicked")');

			// adds the text to the node
			node.append("text")
				.attr("dy", ".35em")
				.attr("y", (d: any) => d.children ? -20 : 20)
				.style("text-anchor", "middle")
				.text((d: any) => d.data.name);
		}
	},
	mounted() {
		this.drawTree(this.convertedTree);
	},
	watch: {
		tree() {
			this.drawTree(this.convertedTree);
		}
	}
});
</script>


<style>
.node circle {
	fill: #fff;
	stroke: steelblue;
	stroke-width: 3px;
}

.node text {
	font: 12px sans-serif;
}

.node--internal text {
	text-shadow: 0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff;
}

.link {
	fill: none;
	stroke: #ccc;
	stroke-width: 2px;
}
</style>
