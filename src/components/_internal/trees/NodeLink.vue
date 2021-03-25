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
			let d = this.d;
			let path = `M${d.x},${d.y}`;
			path += `C${d.x},${(d.y + d.parent.y) / 2}`;
			path += ` ${d.parent.x},${(d.y + d.parent.y) / 2}`;
			path += ` ${d.parent.x},${d.parent.y}`;
			return path;
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
