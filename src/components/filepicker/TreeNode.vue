<template>
	<div class="treeNode">
		<p>{{ name }}</p>
		<div class="children">
			<TreeNode
					class="child"
					v-bind:name="child.name" v-bind:children="child.children"
					v-for="(child,i) in this.children || []" v-bind:key="i">
			</TreeNode>
		</div>
	</div>
</template>

<script>
export default {
	name: 'TreeNode',
	props: {
		name: String,
		children: Array,
	},
	data() {
		return { }
	},
	methods: {}
}
</script>


<style scoped>
p {
	text-align: left;
}

.treeNode .children {
	padding-left: 1em;
	border-left: 1px dotted black;
}
</style>
