<template>
	<div class="tabButton">
		<button @click="handleClick"><slot/></button>
		<button @click="handleClose">Close</button>
	</div>
</template>

<script lang="ts">
import Vue from "vue";

interface DataTypeInterface { }

export default Vue.extend({
	name: 'TabButton',
	data() : DataTypeInterface {
		return {}
	},
	methods: {
		handleClick() : void {
			this.$emit("click");
		},
		handleClose() : void {
			this.$emit("close");
		},
	}
});
</script>


<style scoped>
.tabButton {
	display: inline-block;
	border: 1px solid black;
	margin: 3px 5px;
}
</style>
