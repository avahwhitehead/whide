<template>
	<label class="NumberInput">
		<span>{{name}}</span>
		<input type="number" v-model="model" :placeholder="placeholder" />
	</label>
</template>

<script lang="ts">
import Vue from "vue";

interface DataTypeDescriptor {
	model: number;
}

export default Vue.extend({
	name: 'NumberInputElement',
	props: {
		name: {
			type: String,
		},
		placeholder: {
			type: String,
		},
	},
	data(): DataTypeDescriptor {
		return {
			model: 0,
		};
	},
	watch: {
		model(val: number) {
			this.$emit('change', val);
		}
	}
})
</script>


<!--suppress CssUnusedSymbol -->
<style scoped>

</style>
