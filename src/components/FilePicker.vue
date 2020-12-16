<template>
	<div class="filePicker">
		<div class="treeHolder">
			<TreeNode v-bind:name="file.name" v-bind:children="file.children"
					v-for="(file,i) in struct" v-bind:key="i">
			</TreeNode>
		</div>
	</div>
</template>

<script>
import TreeNode from "@/components/filepicker/TreeNode";
export default {
	name: 'FilePicker',
	components: {TreeNode},
	props: {

	},
	data() {
		return {
			//TODO: Use actual files
			struct: [
				{
					name: "File 1",
				},
				{
					name: "File 2",
				},
				{
					name: "File 3",
				},
				{
					name: "Folder 1",
					children: [
						{
							name: "File 1.1",
						},
						{
							name: "File 1.2",
						},
						{
							name: "Folder 1.1",
							children: [
								{
									name: "File 1.1.1",
								},
								{
									name: "File 1.1.2",
								},
							]
						},
					]
				},
				{
					name: "File 4", type: "file"
				},
			]
		}
	},
	methods: {

	}
}
</script>


<style scoped>

</style>
