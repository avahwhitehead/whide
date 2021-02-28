<template>
	<div class="fileTree">
		<div v-if="file">
			<div v-if="file.file">
				<p @click="onClick(file)">{{ file.name }}</p>
			</div>
			<div v-if="file.folder">
				<p>{{ file.name + '/' }}</p>
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
import { CustomFs, getFs } from "@/files/fs";
import { pathToFile, AbstractInternalFile, InternalFolder } from "@/files/InternalFile";

interface DataTypeInterface {
	file?: AbstractInternalFile;
	fs?: CustomFs;
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
			fs: undefined,
		}
	},
	mounted() {
		getFs().then(fs => {
			this.fs = fs;
			pathToFile(this.directory, fs).then((f : AbstractInternalFile) => this.file = f);
		});
	},
	computed: {

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
			pathToFile(this.directory, this.fs).then((f : AbstractInternalFile) => this.file = f);
		},
		file(newFile : AbstractInternalFile) {
			this.children = undefined;
			if (newFile.folder && (this.loadLevel > 0)) {
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
p {
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
