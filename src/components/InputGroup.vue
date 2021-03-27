<template>
	<div class="InputGroup">
		<InputElement
			:descriptor="element"
			class="input-element"
			v-for="(element, i) of elements"
			:key="i"
		/>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import InputElement, { InputElementDescriptor } from "@/components/InputElement.vue";

export default Vue.extend({
	name: 'InputGroup',
	components: {
		InputElement
	},
	props: {
		elements: {
			type: Array as PropType<InputElementDescriptor[]>
		}
	},
})
</script>


<style scoped>
.input-element {
	border-bottom: 1px solid lightgrey;
	padding: 5px 5px;
}
</style>
