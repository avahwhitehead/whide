<template>
	<div class="tree-container" @scroll.prevent="">
		<svg
			preserveAspectRatio="xMinYMin meet"
			ref="svg-el"
			class="treeViewer"
		>
			<g ref="svg-root">
				<NodeGroup :d="d" v-for="(d, i) in nodes" :key="i" />
			</g>
		</svg>
		<div class="controls">
			<v-btn class="button pa-0 mb-1" @click="() => _zoom(1)">+</v-btn>
			<v-btn class="button pa-0 mb-1" @click="() => _zoom(-1)">-</v-btn>
			<v-btn class="button pa-0 mb-1" @click="focus">Focus</v-btn>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import * as d3 from "d3";
import { HierarchyNode, HierarchyPointNode, TreeLayout, ZoomBehavior, ZoomedElementBaseType } from "d3";
import NodeGroup from "@/components/_internal/trees/NodeGroup.vue";
import { ZoomTransform } from "d3-zoom";

export interface TreeType {
	name: any;
	list?: boolean,
	error?: boolean,
	errorMsg?: string,
	children?: TreeType[];
}

interface DataTypeInterface {
	/**
	 * Base diagram width (scaled as trees are drawn)
	 */
	diagramWidth: number;
	/**
	 * Base diagram height (scaled as trees are drawn)
	 */
	diagramHeight: number;
	/**
	 * The d3 zoom control object
	 */
	initial: {
		x: number,
		y: number,
		z: number,
	},
	/**
	 * The D3 tree structure used to render the tree
	 */
	zoom?: ZoomBehavior<ZoomedElementBaseType, unknown>;
	/**
	 * Initial X/Y/Zoom values. Used to refocus the tree
	 */
	nodes?: HierarchyPointNode<unknown>;
}

export default Vue.extend({
	name: 'VariableTreeViewer',
	props: {
		tree: Object as () => TreeType,
	},
	components: {
		NodeGroup,
	},
	data() : DataTypeInterface {
		return {
			diagramWidth: 660,
			diagramHeight: 500,
			zoom: undefined,
			nodes: undefined,
			initial: {
				x: 0,
				y: 0,
				z: 1,
			}
		};
	},
	methods: {
		/**
		 * Zoom the diagram
		 * @param direction     Positive value to zoom in, negative value to zoom out.
		 */
		_zoom(direction: number): void {
			const svg = d3.select(this.$refs["svg-el"] as Element);
			if (!this.zoom) return;
			svg.transition().duration(200).call(
				this.zoom.scaleBy,
				(direction >= 0) ? 1.25 : .75
			);
		},
		/**
		 * Reset the diagram focus to its initial scale/location
		 */
		focus() {
			if (!this.zoom) return;
			const svg = d3.select(this.$refs["svg-el"] as Element);
			svg.transition().duration(200).call(
				this.zoom.transform,
				d3.zoomIdentity.translate(this.initial.x, this.initial.y).scale(this.initial.z)
			);
		},

		/**
		 * Draw the tree as an SVG diagram.
		 * Based on this example: https://bl.ocks.org/d3noob/72f43406bbe9e104e957f44713b8413c
		 * @param treeData
		 */
		drawTree(treeData: TreeType): void {
			//Build a d3 tree from the nodes
			let nodes = d3.hierarchy(treeData);

			/**
			 * Depth-first traversal of the tree counting the number of nodes at each level.
			 * There is no advantage to a breadth-first search here because of how JS arrays work
			 */
			function _getLayerWidths(node: HierarchyNode<TreeType>, levels: number[]) {
				levels[node.depth] = (levels[node.depth] || 0) + 1
				for (let n of node.children || []) _getLayerWidths(n, levels);
				return levels;
			}
			//Compare the number of nodes at each level to the maximum number of nodes if this was a binary tree
			//This is used to set a constant node width which grows for trees with more children
			let levels = _getLayerWidths(nodes, []);
			levels = levels.map((n:number, i:number) => Math.max(n, i));

			//Scale the diagram based on the tree size
			let width = Math.max(...levels);
			let xScale = width * 100;
			let yScale = nodes.height * 100;
			let zoom = 5 / (width + 1);
			zoom = Math.max(zoom, .25)

			//Assign (x,y) coordinate values to each node in the tree
			let treemap: TreeLayout<unknown> = d3.tree().size([xScale, yScale]);
			let hierarchy: HierarchyPointNode<unknown> = treemap(nodes);

			/**
			 * Travel recursively through a tree, offsetting each node's X and Y value by a fixed amount.
			 * This has the effect of translating the tree left and up.
			 */
			function _offsetTree(node: d3.HierarchyPointNode<unknown>, offsetX: number, offsetY: number): void {
				node.x -= offsetX;
				node.y -= offsetY;
				node.children?.forEach(c => _offsetTree(c, offsetX, offsetY));
			}
			//Align the center of the tree to the centre of the canvas
			//Offset so the root (top middle) is at (0,0) then shift up
			_offsetTree(hierarchy, hierarchy.x, hierarchy.y + yScale/2)
			this.nodes = hierarchy;

			//Store the initial X/Y/Zoom values
			this.initial = { x: 0, y: 0, z: zoom }

			//Zoom the diagram to fit the whole diagram
			if (!this.zoom) return;
			const svg = d3.select(this.$refs["svg-el"] as Element);
			svg.transition().duration(200).call(
				this.zoom.scaleTo,
				this.initial.z,
				[this.initial.x, this.initial.y]
			);
		}
	},
	mounted() {
		//Get the SVG elements
		const svg = d3.select(this.$refs["svg-el"] as Element);
		const parentG = d3.select(this.$refs["svg-root"] as Element);

		//Set up panning on the SVG element
		svg.attr("viewBox", `${-this.diagramWidth/2}, ${-this.diagramHeight/2}, ${this.diagramWidth}, ${this.diagramHeight}`);
		//Set up zooming on the SVG element
		this.zoom = d3.zoom();
		svg.call(this.zoom
			.extent([[0, 0], [this.diagramWidth, this.diagramHeight]])
			.scaleExtent([.1, 10])
			.on("zoom", ({ transform } : { transform: ZoomTransform }) => {
				parentG.attr("transform", transform as any);
			})
		);
		//Draw the initial tree
		this.drawTree(this.tree);
	},
	watch: {
		tree(newTree: TreeType): void {
			//Draw the new tree
			this.drawTree(newTree);
		}
	}
});
</script>


<style scoped>
.tree-container {
	position: relative;
	display: flex;
	flex-direction: column;
	height: 100%;
}

svg.treeViewer {
	border: 1px solid black;
	background-size: contain;
	height: 100%;
	flex: 1;
}

.controls {
	/*Position to the top-right corner*/
	position: absolute;
	top: 5px;
	right: 5px;
	/*Display buttons in a column*/
	width: min-content;
}

.controls .button {
	height: 25px;
	cursor: pointer;

	/*Positioning*/
	width: 100%;

	/*Formatting*/
	padding: 0;
	text-align: center;
	border: 1px solid #999999;
	border-radius: 5px;
	background-color: white;
}
</style>
