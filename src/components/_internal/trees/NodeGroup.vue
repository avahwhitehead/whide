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

		<NodeLink v-if="d.parent" :d="d" />

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
import NodeLink from "./NodeLink.vue";
import VTooltip from 'v-tooltip';
import { TreeType } from "@/components/VariableTreeViewer.vue";

Vue.use(VTooltip);

export default Vue.extend({
	name: 'NodeGroup',
	components: {
		NodeLink,
	},
	props: {
		d: Object as PropType<{ data: TreeType, children: any[] }>,
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

/*noinspection CssUnusedSymbol*/
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
</style>
