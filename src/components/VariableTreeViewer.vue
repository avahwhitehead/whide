<template>
	<div class="parent" @scroll.prevent="">
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
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import * as d3 from "d3";
import { HierarchyPointNode } from "d3";
import NodeGroup from "@/components/_internal/trees/NodeGroup.vue";

export interface TreeType {
	name: any;
	list?: boolean,
	error?: boolean,
	errorMsg?: string,
	children?: TreeType[];
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
		tree: Object as () => TreeType,
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
			let scale = this.scale;
			///Fixed jump size on all browsers
			let jump = .2;
			if (event.deltaY > 0) scale -= jump;
			else scale += jump;

			//Limit zooming in/out
			scale = Math.max(scale, 0.3);
			scale = Math.min(scale, 5);
			//Save the new scale
			this.scale = scale;
		},

		/**
		 * Draw the tree as an SVG diagram.
		 * Based on this example: https://bl.ocks.org/d3noob/72f43406bbe9e104e957f44713b8413c
		 * @param treeData
		 */
		drawTree(treeData: TreeType) {
			//Tell d3 to work with a tree, and stay in the diagram limits
			let treemap = d3.tree().size([this.diagramWidth, this.diagramHeight]);

			//Use the parent-child hierarchy to build the tree
			let nodes: HierarchyPointNode<unknown> = treemap(d3.hierarchy(treeData));

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
		tree(newTree: TreeType): void {
			this.drawTree(newTree);
		}
	}
});
</script>


<style scoped>
svg {
	border: 1px solid black;
}
.parent {
	overflow: hidden;
}
</style>
