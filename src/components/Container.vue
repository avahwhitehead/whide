<template>
	<div class="container">
		<div class="buttons">
			<button v-if="collapsible" @click="toggle_collapse">{{ collapsed ? "Show" : "Collapse" }}</button>
		</div>
		<div :class="{ 'content' : true, 'collapsed' : collapsed, 'open' : !collapsed }">
			<slot></slot>
		</div>
	</div>
</template>


<script lang="ts">
import Vue from "vue";

interface DataTypeInterface {
	collapsed: boolean;
}

export default Vue.extend({
	name: 'Container',
	props: {
		collapsible: {
			type: Boolean,
			default: true
		}
	},
	data() : DataTypeInterface {
		return {
			collapsed: false
		}
	},
	methods: {
		toggle_collapse() : void {
			this.collapsed = !this.collapsed;
		},
	}
});
</script>


<style scoped>
/*noinspection CssUnusedSymbol*/
.content.collapsed {
	display: none;
}

.container {
	overflow: auto;
	padding: 5px;
}
</style>