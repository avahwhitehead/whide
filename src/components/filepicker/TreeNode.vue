<template>
	<div class="treeNode">
		<div v-if="file">
			<p @click="onChange(file)">{{ file.name + (!!this.file.children ? '/' : '') }}</p>
			<div class="children" v-if="!!this.file.children">
				<TreeNode v-bind:file="child"
						class="child" @change="v => onChange(v)"
						v-for="(child,i) in this.file.children" v-bind:key="i">
				</TreeNode>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { AbstractFileData } from "@/fileStore/AbstractFileData";

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
	methods: {
		onChange(v : AbstractFileData) : void {
			this.$emit("change", v);
		}
	}
});
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
