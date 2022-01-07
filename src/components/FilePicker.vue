<template>
	<div>
		<div style="text-align: left">
			<slot name="controls" />
		</div>
		<TreeView
			:open.sync="open"
			:items="items"
			:load-children="loadFolderChildren"
			:search="filter ? '.while' : undefined"
			text-key="name"
			id-key="path"
			children-key="children"
			keep-empty-parent
			dense
			@click="onFileClick"
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
		</TreeView>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { fs } from "@/files/fs";
import path from "path";
import { Stats } from "fs";
import FolderWatcherManager from "@/files/FolderWatcherManager";
import TreeView from "@/components/TreeView.vue";

interface DataTypeInterface {
	items: FileType[];
	open: FileType[];
}

interface FileType {
	name: string;
	path: string;
	open: boolean;
	children?: FileType[];
}

export default Vue.extend({
	name: 'FilePicker',
	components: {
		TreeView
	},
	props: {
		directory: {
			type: String,
		},
		hideFiles: {
			type: Boolean,
			default: false,
		},
		filter: {
			type: Boolean,
			default: false,
		},
	},
	data() : DataTypeInterface {
		return {
			open: [],
			items: [],
		}
	},
	mounted() {
		//Set up file watchers and open the root folder
		this._onDirectoryChange(this.directory);
	},
	beforeDestroy() {
		//Close the filewatchers before the element is destroyed
		for (let folder of this.open) {
			this._unwatchDirectory(folder.path)
		}
	},
	methods: {
		_watchDirectory(filepath: string) {
			FolderWatcherManager.watch(filepath, this._onWatcherTrigger);
		},
		_unwatchDirectory(filepath: string) {
			FolderWatcherManager.unwatch(filepath, this._onWatcherTrigger);
		},
		_onWatcherTrigger(change: string, filepath: string): void {
			let item = this._findItemFromPath(filepath);
			if (item) this.loadFolderChildren(item);
		},
		/**
		 * Search through the {@code items} list looking for a file that matches the provided file path.
		 * Dynamically searches through the items to reduce search time.
		 * @param filepath  The path to look for
		 * @param items     (Optional) the items list to search through.
		 *                  Defaults to {@code this.items}.
		 * @returns {FileType}  The item that represents that file path
		 * @returns {null}      Could not find a matching path
		 */
		_findItemFromPath(filepath: string, items?: FileType[]): FileType|null {
			//Use the provided items list, or the fallback
			items = items || this.items;

			//Normalize the filepath for comparison with each item
			let normalizedFilepath = path.normalize(filepath);

			for (let item of items) {
				//Normalize this item's path
				let normalizedPath = path.normalize(item.path);

				if (normalizedPath === normalizedFilepath) {
					//The paths are the same - return the found item
					return item;
				} else if (normalizedPath === normalizedFilepath.substr(0, normalizedPath.length)) {
					if (item.children) {
						//The item is a parent folder of the file - search in its children
						return this._findItemFromPath(normalizedFilepath, item.children);
					}
					//Otherwise this is a file with the same name as a parent path
					// keep looking for the file
				}
			}
			return null;
		},
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

					//Don't show any files if requested
					if (this.hideFiles && !isDirectory) continue;

					//Add a trailing slash to folder names
					if (isDirectory) name += '/';

					//Add the child to the list
					res.push({
						name: name,
						path: fullPath,
						open: false,
						//Only add a `children` list if this is a folder
						//`undefined` means file, empty list means unloaded, populated list means loaded
						children: isDirectory ? [] : undefined,
					});
				} catch (e) {
					console.error(`Couldn't read file "${fullPath}" `, e);
				}
			}
			//Combine the folder's new children with its old children to prevent unnecessary reloading
			this.mergeChildren(res, folder.children);
			//Update the filtered children list
			folder.children = res;
		},
		/**
		 * Combine the children of a new folder with its already loaded counterpart.
		 * The `children` property of each folder in the new list is set to that of its equivalent in the old list.
		 * @param newChildren   The new list of children
		 * @param oldChildren   The old list of children
		 * @returns {@code newChildren}
		 */
		mergeChildren(newChildren: FileType[], oldChildren: FileType[]): FileType[] {
			for (let i = 0; i < newChildren.length; i++) {
				let child = newChildren[i];
				let oldChildIndex = oldChildren.findIndex(v => v.path === child.path);
				if (oldChildIndex === -1) continue;

				child.children = oldChildren[oldChildIndex].children;
				oldChildren.splice(oldChildIndex, 1);
			}
			return newChildren;
		},
		async _onDirectoryChange(directory: string, olddir?: string): Promise<void> {
			//Close the file watcher on the old root
			if (olddir !== undefined) this._unwatchDirectory(olddir);
			this._watchDirectory(directory);

			//Create a new root element
			let root: FileType = {
				name: `${path.basename(this.directory)}/`,
				path: this.directory,
				children: [],
				open: true,
			};

			//Load the root folder's immediate children
			await this.loadFolderChildren(root);

			//Update the tree with the new root
			this.items = [root];
			this.open = [root];
		},

		onFileClick(item: FileType) {
			let filePath = item.path;
			//Emit a general 'change' event when any file is selected
			this.$emit('change', filePath);

			//Emit a specific file or folder 'change' event
			if (item.children) {
				this.$emit('changeFolder', filePath);
			} else {
				this.$emit('changeFile', filePath);
			}
		},
	},
	watch: {
		directory(directory: string, olddir: string) {
			this._onDirectoryChange(directory, olddir)
		},

		open(open: FileType[], oldOpen: FileType[]) {
			//Get the folders which were just closed
			let closedFolders = oldOpen.filter(v => open.indexOf(v) === -1);
			//Get the folders which were just opened
			let openedFolders = open.filter(v => oldOpen.indexOf(v) === -1);

			for (let folder of closedFolders) {
				//Unload the closed folder's children
				folder.children = [];
				//Close the directory watcher
				this._unwatchDirectory(folder.path);
			}

			//Open a directory watcher
			for (let folder of openedFolders) {
				this._watchDirectory(folder.path);
			}
		},
	},
});
</script>


