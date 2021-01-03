<template>
	<div class="treeNode">
		<p @click="onChange(file)">{{ file.name }}</p>
		<div class="children">
			<TreeNode v-bind:file="child"
					class="child" @change="v => onChange(v)"
					v-for="(child,i) in this.file.children" v-bind:key="i">
			</TreeNode>
		</div>
	</div>
</template>

<script>
import { AbstractFileData } from "@/fileStore/AbstractFileData.ts";

export default {
	name: 'TreeNode',
	props: {
		file: AbstractFileData,
	},
	data() {
		return { }
	},
	methods: {
		onChange(v) {
			this.$emit("change", v);
		}
	}
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
