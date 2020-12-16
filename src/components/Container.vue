<template>
	<div class="container">
		<div class="buttons">
			<button v-if="collapsible" @click="toggle_collapse">{{ collapsed ? "Show" : "Collapse" }}</button>
		</div>
		<div :class="'content ' + (collapsed ? 'collapsed' : 'open')">
			<slot></slot>
		</div>
	</div>
</template>


<script>
export default {
	name: 'Container',
	props: {
		collapsible: {
			type: Boolean,
			default: true
		}
	},
	data() {
		return {
			collapsed: false
		}
	},
	methods: {
		toggle_collapse() {
			this.collapsed = !this.collapsed;
		},
	}
};
</script>


<style scoped>
.content.collapsed {
	display: none;
}

.container {
	overflow: auto;
	padding: 5px;
}
</style>