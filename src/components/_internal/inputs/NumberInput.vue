<template>
	<label class="NumberInput">
		<span v-if="name" class="input-name" v-text="name" />
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
			default: 'Your value'
		},
		value: {
			type: String,
			required: false,
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
		},
		value(val?: string) {
			if (!val) return;
			let v: number = Number.parseInt(val);
			if (isNaN(v)) return;
			this.model = v;
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
