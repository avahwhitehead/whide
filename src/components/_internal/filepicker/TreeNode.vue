<template>
	<div class="treeNode">
		<div v-if="file">
			<p @click="onClick(file)">{{ file.name + (!!this.file.children ? '/' : '') }}</p>
			<div class="children" v-if="!!this.file.children">
				<TreeNode v-bind:file="child"
						class="child" @change="onClick"
						v-for="(child,i) in sortedChildren" v-bind:key="i">
				</TreeNode>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { AbstractFileData} from "@/fileStore/internal/AbstractFileData";
import { FolderData } from "@/fileStore/internal/FolderData";

interface DataTypeInterface {

}

export default Vue.extend({
	name: 'TreeNode',
	props: {
		file: AbstractFileData,
	},
	data() : DataTypeInterface {
		return {};
	},
	computed: {
		sortedChildren() : AbstractFileData[] {
			let children: AbstractFileData[] = (this.file as FolderData).children || [];
			children.sort((a, b) => {
				if (a.name === b.name) return 0;
				return (a.name > b.name) ? 1 : -1;
			});
			return children;
		}
	},
	methods: {
		onClick(v : AbstractFileData) : void {
			this.$emit("change", v);
		}
	}
});
</script>


<style scoped>
p {
	text-align: left;
	user-select: none;
}

.treeNode .children {
	padding-left: 1em;
	border-left: 1px dotted black;
}
</style>
