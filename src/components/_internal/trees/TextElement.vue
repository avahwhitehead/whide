<template>
	<text
		dy=".35em"
		:y="d.children ? -20 : 20"
		v-text="d.data.name"
		class="node-text"
	/>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export default Vue.extend({
	name: 'CircleElement',
	props: {
		d: Object as PropType<any>,
	},
	methods: {
		handleClick() {
			this.$emit('click');
		}
	}
});
</script>


<style scoped>
.node-text {
	text-anchor: middle;
	font: 12px sans-serif;
}
</style>
