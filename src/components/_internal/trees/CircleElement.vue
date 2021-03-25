<template>
	<circle
		:r="this.radius"
		class="node-circle"
		@click="handleClick"
	/>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
	name: 'CircleElement',
	props: {
		radius: Number,
	},
	methods: {
		handleClick() {
			this.$emit('click');
		}
	}
});
</script>


<style scoped>
.node-circle {
	fill: #fff;
	stroke: steelblue;
	stroke-width: 3px;
}
</style>
