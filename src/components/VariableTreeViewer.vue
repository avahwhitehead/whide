<template>
	<div class="parent" @scroll.prevent="">
		<svg
			:height="height"
			preserveAspectRatio="xMinYMin meet"
			ref="svg-el"
		>
			<g ref="svg-root">
				<NodeGroup :d="d" v-for="(d, i) in nodes" :key="i" />
			</g>
		</svg>
		<div class="controls">
			<input type="button" class="button" @click="() => _zoom(1)" value="+" />
			<input type="button" class="button" @click="() => _zoom(-1)" value="-" />
			<input type="button" class="button" @click="focus" value="Reset" />
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import * as d3 from "d3";
import { HierarchyPointNode, TreeLayout, ZoomBehavior, ZoomedElementBaseType } from "d3";
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
	zoom?: ZoomBehavior<ZoomedElementBaseType, unknown>;
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
			margin: {
				left: 20,
				right: 20,
				top: 20,
				bottom: 20,
			},
			width: 660,
			height: 500,
			zoom: undefined,
			nodes: undefined,
		};
	},
	computed: {
		diagramWidth() : number {
			return (this.width - this.margin.left - this.margin.right);
		},
		diagramHeight() : number {
			return (this.height - this.margin.top - this.margin.bottom);
		},
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
				d3.zoomIdentity,
				d3.zoomTransform(svg.node() as any).invert([this.diagramWidth / 2, this.diagramHeight / 2])
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

			//Scale for the diagram based on the tree size
			let scale = Math.max((nodes?.height || 10), 2);

			//Draw the tree, dynamically setting the sizes
			let treemap: TreeLayout<unknown> = d3.tree().size([scale * 100, scale * 100]);
			this.nodes = treemap(d3.hierarchy(treeData));
		}
	},
	mounted() {
		//Get the SVG elements
		const svg = d3.select(this.$refs["svg-el"] as Element);
		const parentG = d3.select(this.$refs["svg-root"] as Element);

		//Set up panning on the SVG element
		svg.attr("viewBox", `${0}, ${0}, ${this.diagramWidth}, ${this.diagramHeight}`);
		//Set up zooming on the SVG element
		this.zoom = d3.zoom();
		svg.call(this.zoom
			.extent([[0, 0], [this.diagramWidth, this.diagramHeight]])
			.scaleExtent([.1, 10])
			.on("zoom", ({ transform } : { transform: { k:number, x:number, y:number } }) => {
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
svg {
	border: 1px solid black;
}

.parent {
	overflow: hidden;
	position: relative;
	max-width: min-content;
	margin-left: auto;
	margin-right: auto;
}

.controls {
	/*Position to the top-right corner*/
	position: absolute;
	top: 5px;
	right: 5px;
	/*Display buttons as a stack*/
	width: 50px;
}

.controls .button {
	height: 25px;
	cursor: pointer;

	/*Positioning*/
	width: 100%;
	margin-bottom: 5px;

	/*Formatting*/
	padding: 0;
	text-align: center;
	border: 1px solid #999999;
	border-radius: 5px;
	background-color: white;
}
</style>
