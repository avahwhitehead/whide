<template>
	<!-- TODO: Make folders collapsible -->
	<!-- TODO: Use folder expand instead of "load" button -->
	<div class="fileTree">
		<div v-if="file">
			<p @click="onClick(file)" v-text="displayName" />

			<div v-if="file.folder">
				<div v-if="children" class="children">
					<FilePicker
						:directory="child.fullPath"
						:loadLevel="loadLevel - 1"
						class="child" @change="onClick"
						v-for="(child,i) in children" v-bind:key="i"
					/>
				</div>
				<div v-else class="children">
					<button @click="runLoadChildren" class="load-button">Load</button>
				</div>
			</div>
		</div>
		<div v-else>
			<span>Loading ...</span>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { CustomFsContainer, getFsContainer } from "@/files/fs";
import { pathToFile, AbstractInternalFile, InternalFolder } from "@/files/InternalFile";

interface DataTypeInterface {
	file?: AbstractInternalFile;
	fsContainer?: CustomFsContainer;
	children?: AbstractInternalFile[];
}

export default Vue.extend({
	name: 'FilePicker',
	props: {
		directory: {
			type: String,
		},
		loadLevel: {
			type: Number,
			default: 1,
		},
	},
	data() : DataTypeInterface {
		return {
			children: undefined,
			file: undefined,
			fsContainer: undefined,
		}
	},
	computed: {
		displayName(): string {
			//Shouldn't happen
			if (!this.file) return 'undefined';

			//This is a file - only show the name
			if (this.file.file) return this.file.name;
			//This is a folder - add a trailing slash
			return `${this.file.name}/`;
		}
	},
	mounted() {
		getFsContainer().then(container => {
			this.fsContainer = container;
			pathToFile(this.directory, container).then((f : AbstractInternalFile) => this.file = f);
		});
	},
	methods: {
		onClick(file : AbstractInternalFile) {
			this.$emit("change", file);
		},
		runLoadChildren() : void {
			if (!this.file || !this.file.folder) return;

			(this.file as InternalFolder).loadChildren().then(c => this.children = c);
		},
	},
	watch: {
		directory() {
			this.file = undefined;
			pathToFile(this.directory, this.fsContainer).then((f : AbstractInternalFile) => this.file = f);
		},
		file(newFile : AbstractInternalFile) {
			this.children = undefined;
			if (newFile && newFile.folder && (this.loadLevel > 0)) {
				const folder: InternalFolder = newFile as InternalFolder;

				folder.loadChildren().then(() => {
					this.children = folder.children;
				});
			}
		}
	},
});
</script>


<style scoped>
.fileTree {
	text-align: left;
}

.fileTree p {
	text-align: left;
	user-select: none;
}

.fileTree .children {
	padding-left: 1em;
	border-left: 1px dotted black;
}

.fileTree .load-button {
	padding: 0;
}
</style>
