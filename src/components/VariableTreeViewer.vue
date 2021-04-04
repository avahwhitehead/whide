<template>
	<svg
		:height="height"
		:viewBox="viewbox"
		preserveAspectRatio="xMinYMin meet"
		@mousedown="startDrag"
		@mouseup="stopDrag"
		@mousemove="handleDrag"
		@wheel="handleZoom"
	>
		<g ref="mysvg"/>
	</svg>
</template>

<script lang="ts">
import Vue from "vue";
import * as d3 from "d3";
import { HierarchyPointNode } from "d3";
import NodeGroup from "@/components/_internal/trees/NodeGroup.vue";
import { BinaryTree, ConvertedBinaryTree } from "@whide/tree-lang";

export interface TreeType {
	name: any;
	error?: boolean,
	errorMsg?: string,
	children?: TreeType[];
}

/**
 * Convert a binary tree into d3's more general tree format
 * @param tree	The binary tree in the external format
 * @param error	(INTERNAL ONLY) Used to determine whether subtrees should be drawn as errors
 * @returns The {@code tree} represented in d3's tree format
 */
function _convertTree(tree: ConvertedBinaryTree|BinaryTree, error = false,) : TreeType {
	//Separate into the two accepted types for convenience
	let binary = (tree as BinaryTree);
	let conv = (tree as ConvertedBinaryTree);

	//Display 'null' nodes as 'nil'
	if (binary === null) {
		return {
			name: 'nil',
			children: [],
		};
	}

	//Label the node 'nil' if it is null, or use its value
	let name: string|number = '';
	if (conv.value === null) name = 'nil';
	else if (conv.value !== undefined) name = conv.value;

	//Show as an error if the parameter is true, or if the node has an error message
	const isErrored = error || !!conv.error;

	//Add the children
	let children = [];
	if (conv.left !== undefined) children.push(_convertTree(conv.left, isErrored));
	if (conv.right !== undefined) children.push(_convertTree(conv.right, isErrored));

	//Return the created node
	return {
		name: name,
		errorMsg: conv.error,
		error: isErrored,
		children,
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
	//Information for dragging the svg canvas
	drag: {
		//Whether the canvas is being dragged
		dragging: boolean;
		//Current X/Y offset
		offset: {
			x: number;
			y: number;
		};
		//The X/Y offset when the dragging started
		start: {
			x: number;
			y: number;
		};
	};
	scale: number;
}

export default Vue.extend({
	name: 'VariableTreeViewer',
	props: {
		tree: Object as () => ConvertedBinaryTree,
	},
	data() : DataTypeInterface {
		return {
			margin: {
				left: 20,
				right: 20,
				top: 20,
				bottom: 20,
			},
			width: 660,
			height: 500,
			drag: {
				dragging: false,
				offset: { x: -66, y: 50 },
				start: { x: 0, y: 0 },
			},
			scale: 1.25
		};
	},
	computed: {
		diagramWidth() : number {
			return this.width - this.margin.left - this.margin.right;
		},
		diagramHeight() : number {
			return this.height - this.margin.top - this.margin.bottom;
		},
		viewbox() : string {
			const X = this.drag.offset.x;
			const Y = this.drag.offset.y;
			const width = this.width;
			const height = this.height;
			const scale = this.scale;

			return `${-X / scale} ${-Y / scale} ${width / scale} ${height / scale}`;
		},
	},
	methods: {
		startDrag(event: MouseEvent) {
			this.drag.dragging = true;
			//Save the cursor position at the start of the drag
			this.drag.start = {
				x: event.offsetX - this.drag.offset.x,
				y: event.offsetY - this.drag.offset.y,
			};
		},
		stopDrag() {
			this.drag.dragging = false;
		},
		handleDrag(event: MouseEvent) {
			if (!this.drag.dragging) return;
			//Update the offset to be the difference in position since the `startDrag` was called
			this.drag.offset = {
				x: event.offsetX - this.drag.start.x,
				y: event.offsetY - this.drag.start.y,
			}
		},
		handleZoom(event: WheelEvent) {
			//Scale by to adjust the jump size
			this.scale += (-.05 * event.deltaY);
			//Limit zooming in/out
			this.scale = Math.max(this.scale, 0.3);
			this.scale = Math.min(this.scale, 5);
		},

		/**
		 * Draw the tree as an SVG diagram.
		 * Based on this example: https://bl.ocks.org/d3noob/72f43406bbe9e104e957f44713b8413c
		 * @param treeData
		 */
		drawTree(treeData: ConvertedBinaryTree) {
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
		tree(newTree: ConvertedBinaryTree) {
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
