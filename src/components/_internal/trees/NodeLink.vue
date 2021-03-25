<template>
	<path
		:d="path"
		class="link"
	/>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export default Vue.extend({
	name: 'NodeLink',
	props: {
		d: Object as PropType<any>,
	},
	computed: {
		path() : string {
			//Shorthand definitions
			const pX = this.d.parent.x - this.d.x;
			const pY = this.d.parent.y - this.d.y;

			//Cubic curve from the current node to its parent
			//The current node is centred at (0,0)
			return `M0,0C0,${pY/2} ${pX},${pY/2} ${pX},${pY}`;
		}
	}
});
</script>


<style scoped>
.link {
	fill: none;
	stroke: #ccc;
	stroke-width: 2px;
}
</style>
