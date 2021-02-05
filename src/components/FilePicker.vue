<template>
	<div class="filePicker">
		<div class="treeHolder">
			<TreeNode v-bind:file="file" @change="onChange(file)"
					v-for="(file,i) in files" v-bind:key="i">
			</TreeNode>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import TreeNode from "@/components/filepicker/TreeNode.vue";
import { AbstractFileData } from "@/fileStore/AbstractFileData";

interface DataTypeInterface {
	active_file : AbstractFileData|null;
}

export default Vue.extend({
	name: 'FilePicker',
	components: {
		TreeNode
	},
	props: {
		files: {
			type: Array,
			default: () => [],
		}
	},
	data() : DataTypeInterface {
		return {
			active_file: null,
		}
	},
	methods: {
		onChange(file : AbstractFileData) {
			this.active_file = file;
			this.$emit("change", file);
		}
	}
});
</script>


<style scoped>

</style>
