<template>
	<label class="StringInput">
		<span>{{name}}</span>
		<input type="text" v-model="model" :placeholder="placeholder" />
	</label>
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
		}
	}
})
</script>


<!--suppress CssUnusedSymbol -->
<style scoped>

</style>
