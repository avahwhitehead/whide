<template>
	<label class="StringInput">
		<span v-if="name" class="input-name" v-text="name" />
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
