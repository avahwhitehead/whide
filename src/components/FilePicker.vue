<template>
	<div class="filePicker">
		<div class="treeHolder">
			<TreeNode v-bind:file="file" @change="onChange(file)"
					v-for="(file,i) in files" v-bind:key="i">
			</TreeNode>
		</div>
	</div>
</template>

<script>
import TreeNode from "@/components/filepicker/TreeNode";
export default {
	name: 'FilePicker',
	components: {
		TreeNode
	},
	props: {
		files: Array,
	},
	data() {
		return {
			active_file: null,
		}
	},
	methods: {
		onChange(file) {
			this.active_file = file;
			this.$emit("change", file);
		}
	}
}
</script>


<style scoped>

</style>
