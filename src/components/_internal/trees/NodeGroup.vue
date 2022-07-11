<template>
	<g
		class="node"
		:class="{
			'node-internal': d.children,
			'node-leaf': !d.children,
			'error': d.data.error,
		}"
		:transform="`translate(${d.x},${d.y})`"
	>
		<circle
			:r="10"
			v-if="isCircleVisible"
			class="node-circle"
			:class="{ 'list': d.data.list }"
			@click="handleClick"
			v-tooltip="circleTooltip"
		/>

		<path
			:d="path"
			class="link"
			v-if="d.parent"
		/>

		<text
			dy=".35em"
			:y="d.children ? -20 : 20"
			v-text="d.data.name"
			class="node-text"
		/>
	</g>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import VTooltip from 'v-tooltip';
import { TreeType } from "@/types/TreeType";
import { HierarchyPointNode } from "d3";

Vue.use(VTooltip);

export default Vue.extend({
	name: 'NodeGroup',
	props: {
		d: Object as PropType<HierarchyPointNode<TreeType>>,
	},
	computed: {
		circleTooltip() : any {
			return {
				content: this.d.data.errorMsg,
				placement: "right",
			};
		},
		isCircleVisible(): boolean {
			const data = this.d.data;
			return !this.d.children || !!data.error || !!data.list;
		},
		path() : string {
			//Shorthand definitions
			const pX = this.d.parent!.x - this.d.x;
			const pY = this.d.parent!.y - this.d.y;

			//Cubic curve from the current node to its parent
			//The current node is centred at (0,0)
			return `M0,0C0,${pY/2} ${pX},${pY/2} ${pX},${pY}`;
			// return `M0,0L${pX},${pY}`;
		}
	},
	methods: {
		handleClick() {
			this.$emit('click');
		},
	},
});
</script>


<style scoped>
.node {

}

.node .node-circle {
	fill: #fff;
	stroke: steelblue;
	stroke-width: 3px;
}

.node .node-circle.list {
	stroke: green;
}

.node.error .node-circle {
	stroke: red;
	fill: pink;
}

.node .node-text {
	text-anchor: middle;
	font: 12px sans-serif;
	user-select: none;
}

.link {
	fill: none;
	stroke: #BBB;
	stroke-width: 4px;
}
</style>
