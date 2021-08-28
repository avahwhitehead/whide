<template>
	<v-container>
		<v-row>
			<slot name="controls"></slot>
		</v-row>
		<v-row>
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
				return-object
				transition
				style="text-align: left;"
				ref="treeViewer"
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
		</v-row>
	</v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { fs } from "@/files/fs";
import path from "path";
import { Stats } from "fs";

interface DataTypeInterface {
	items: FileType[];
	open: FileType[];
	active: FileType[];
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
		hideFiles: {
			type: Boolean,
			default: false,
		}
	},
	data() : DataTypeInterface {
		let root = {
			name: `${path.basename(this.directory)}/`,
			path: this.directory,
			children: [],
		};
		return {
			open: [root],
			active: [],
			items: [root],
		}
	},
	computed: {
		rootName(): string {
			return `${path.basename(this.directory)}/`
		}
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

					//Don't save any files if requested
					if (!isDirectory && this.hideFiles) continue;

					//Add a trailing slash to folder names
					if (isDirectory) name += '/';

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
		/**
		 * Force a node's children to be reloaded next time it is opened.
		 * See bug report here: https://github.com/vuetifyjs/vuetify/issues/10587#issuecomment-770680909
		 * @param ids    ID values of the nodes to unload
		 */
		markNodeUnloaded(...ids: string[]) {
			let treeViewer = this.$refs.treeViewer as (Vue & { nodes: any[]; updateVnodeState: (id: string) => void });
			if (!treeViewer) return;

			let nodes = treeViewer.nodes;
			for (const nodeKey in nodes) {
				if (nodes[nodeKey].vnode) {
					nodes[nodeKey].vnode.hasLoaded = false
				}
			}
			for (let id of ids) treeViewer.updateVnodeState(id);
		}
	},
	watch: {
		active(active: FileType[]) {
			if (active.length === 0) return;

			let filePath = active[0].path;
			//Emit a general 'change' event when any file is selected
			this.$emit('change', filePath);

			//Emit a specific file or folder 'change' event
			if (active[0].children) {
				this.$emit('changeFolder', filePath);
			} else {
				this.$emit('changeFile', filePath);
			}
		},
		async directory(directory: string) {
			//Open the new directory in the file picker
			//And display its children
			let root = {
				name: `${path.basename(directory)}/`,
				path: directory,
				children: [],
			};
			this.items = [root];
			await this.loadFolderChildren(root);
			this.open = [root];
			this.active = [root];
		},

		open(open: FileType[], oldOpen: FileType[]) {
			//Get the folders which were closed
			let closedFolders = oldOpen.filter(v => open.indexOf(v) === -1);

			//Unload all the closed folders' children
			for (let file of closedFolders) file.children = [];

			//Force the child files to be reloaded next time the folder is open
			//See: https://github.com/vuetifyjs/vuetify/issues/10587#issuecomment-770680909
			this.markNodeUnloaded(...closedFolders.map(file => file.path));
		},
	},
});
</script>


<style scoped>

</style>
