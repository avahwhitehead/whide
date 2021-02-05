<template>
	<div class="filePicker">
		<div class="treeHolder">
			<TreeNode v-bind:file="file" @change="f => onChange(f)"
					v-for="(file,i) in sortedFiles" v-bind:key="i">
			</TreeNode>
		</div>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
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
			type: Array as PropType<Array<AbstractFileData>>,
			default: () => [],
		}
	},
	data() : DataTypeInterface {
		return {
			active_file: null,
		}
	},
	computed: {
		sortedFiles() : AbstractFileData[] {
			let f : AbstractFileData[] = this.files;
			f.sort((a, b) => {
				if (a.name === b.name) return 0;
				return (a.name > b.name) ? 1 : -1;
			});
			return f;
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
