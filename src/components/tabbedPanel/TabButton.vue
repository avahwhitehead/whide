<template>
	<div class="tabButton">
		<button @click="handleClick"><slot/></button>
		<button @click="handleClose">Close</button>
	</div>
</template>

<script>
export default {
	name: 'TabButton',
	data() {
		return {}
	},
	methods: {
		handleClick() {
			this.$emit("click");
		},
		handleClose() {
			this.$emit("close");
		},
	}
}
</script>


<style scoped>
.tabButton {
	display: inline-block;
	border: 1px solid black;
	margin: 3px 5px;
}
</style>
