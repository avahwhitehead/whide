<template>

</template>

<script lang="ts">
import Vue from "vue";

interface DataTypeDescriptor {
	model: string;
}

export default Vue.extend({
	name: 'StringInputElement',
	props: {
		name: {
			type: String,
		},
		placeholder: {
			type: String,
			default: 'Your text'
		},
	},
	data(): DataTypeDescriptor {
		return {
			model: '',
		};
	},
	watch: {
		model(val: string) {
			this.$emit('change', val);
		},
		value(val?: string) {
			if (!val) return;
			this.model = val;
		}
	}
})
</script>


<!--suppress CssUnusedSymbol -->
<style scoped>
.input-name {
	margin-right: .5em;
}
</style>
