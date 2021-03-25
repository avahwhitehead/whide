<template>
	<g
		class="node"
		:class="{
			'node-internal': d.children,
			'node-leaf': !d.children
		}"
		:transform="`translate(${d.x},${d.y})`"
	>
		<NodeLink v-if="d.parent" :d="d" />

		<circle
			:r="10"
			class="node-circle"
			@click="handleClick"
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
import NodeLink from "./NodeLink.vue";

export default Vue.extend({
	name: 'NodeGroup',
	components: {
		NodeLink,
	},
	props: {
		d: Object as PropType<any>,
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

.node .node-text {
	text-anchor: middle;
	font: 12px sans-serif;
}
</style>
