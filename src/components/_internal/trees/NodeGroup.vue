<template>
	<g
		class="node"
		:class="{
			'node--internal': d.children,
			'node--leaf': !d.children
		}"
		:transform="`translate(${d.x},${d.y})`"
	/>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export default Vue.extend({
	name: 'NodeGroup',
	props: {
		d: Object as PropType<any>,
	},
});
</script>


<style scoped>
.node {

}

.node--internal text {
	text-shadow: 0 1px 0 #fff, 0 -1px 0 #fff, 1px 0 0 #fff, -1px 0 0 #fff;
}
</style>
