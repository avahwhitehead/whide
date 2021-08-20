<template>
	<v-treeview
		:active.sync="active"
		:open.sync="open"
		:items="items"
		:load-children="loadFolderChildren"
		item-text="name"
		item-key="path"
		item-children="children"
		selection-type="independent"
		activatable
		dense
		hoverable
		open-on-click
		transition
		style="text-align: left;"
	>
		<template v-slot:prepend="{ item, open }">
			<template v-if="item.children">
				<v-icon v-if="open">fa-folder-open</v-icon>
				<v-icon v-else>fa-folder</v-icon>
			</template>
			<v-icon v-else>
				fa-file-alt
			</v-icon>
		</template>
	</v-treeview>
</template>

<script lang="ts">
import Vue from "vue";
import { fs } from "@/files/fs";
import path from "path";
import { Stats } from "fs";

interface DataTypeInterface {
	items: FileType[];
	open: string[];
	active: string[];
}

interface FileType {
	name: string;
	path: string;
	children?: FileType[];
}

export default Vue.extend({
	name: 'FilePicker',
	props: {
		directory: {
			type: String,
		},
		showControls: {
			//TODO: Add controls support
			type: Boolean,
			default: true,
		}
	},
	data() : DataTypeInterface {
		return {
			open: [this.directory],
			active: [],
			items: [
				{
					name: 'root',
					path: this.directory,
					children: [],
				}
			],
		}
	},
	computed: {

	},
	methods: {
		async loadFolderChildren(folder: FileType) : Promise<void> {
			//Don't try and load from files
			if (!folder.children) return;

			//Read the children of the folder
			let files: string[] = await fs.promises.readdir(folder.path);

			//Iterate over the children
			let res: FileType[] = [];
			for (let name of files) {
				//Get the child's full path
				let fullPath = path.join(folder.path, name);
				try {
					//Check whether this is a file or a folder
					let stats: Stats = await fs.promises.stat(fullPath);
					let isDirectory = stats.isDirectory();

					//Add the child to the list
					res.push({
						name: name,
						path: fullPath,
						//Only add a `children` list if this is a folder
						//`undefined` means file, empty list means unloaded, populated list means loaded
						children: isDirectory ? [] : undefined,
					});
				} catch (e) {
					console.error(`Couldn't read file "${fullPath}" `, e);
				}
			}
			//Add the children to the parent node in the tree
			folder.children = res;
		},
	},
	watch: {
		active(active: string[]) {
			if (active.length > 0) {
				this.$emit('change', active[0]);
			}
		},
	},
});
</script>


<style scoped>

</style>
