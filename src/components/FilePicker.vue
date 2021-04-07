<template>
	<div class="fileTree">
		<div v-if="file">
			<div>
				<font-awesome-icon
					v-if="file.folder"
					class="collapse-icon"
					:class="{'expanded': expanded, 'collapsed': !expanded}"
					:icon="expanded ? 'caret-down' : 'caret-right'"
					@click="toggleExpand"
				/>

				<span v-if="file.folder" @click="onClick(file)" @dblclick="toggleExpand" v-text="displayName" />
				<span v-else @click="onClick(file)" @dblclick="onClick(file)" v-text="displayName" />

				<span class="controls-holder" v-if="showControls">
					<font-awesome-icon
						class="refresh-icon"
						icon="sync"
						title="Refresh"
						@click="refreshClick"
					/>
				</span>
			</div>

			<div v-if="file.folder && expanded">
				<div v-if="children" class="children">
					<FilePicker
						:directory="child.fullPath"
						:loadLevel="loadLevel - 1"
						class="child" @change="onClick"
						:show-controls="false"
						v-for="(child,i) in children" v-bind:key="i"
					/>
				</div>
				<div v-else class="children">
					<span class="child empty">(No children)</span>
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
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCaretDown, faCaretRight, faSync } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(faCaretDown, faCaretRight, faSync);
import { pathToFile, AbstractInternalFile, InternalFolder } from "@/files/InternalFile";

interface DataTypeInterface {
	file?: AbstractInternalFile;
	children?: AbstractInternalFile[];
	expanded: boolean;
}

export default Vue.extend({
	name: 'FilePicker',
	components: {
		FontAwesomeIcon,
	},
	props: {
		directory: {
			type: String,
		},
		loadLevel: {
			type: Number,
			default: 1,
		},
		showControls: {
			type: Boolean,
			default: true,
		}
	},
	data() : DataTypeInterface {
		return {
			children: undefined,
			file: undefined,
			expanded: false,
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
		},
	},
	mounted() {
		pathToFile(this.directory).then((f : AbstractInternalFile) => this.file = f);
	},
	methods: {
		onClick(file : AbstractInternalFile) {
			this.$emit("change", file);
		},
		runLoadChildren() : void {
			if (!this.file || !this.file.folder) return;
			(this.file as InternalFolder).loadChildren().then(c => {
				this.children = c
			});
		},
		toggleExpand() {
			this.expanded = !this.expanded;
		},
		refreshClick() {
			this.children = [];
			this.runLoadChildren();
		}
	},
	watch: {
		directory() {
			this.file = undefined;
			pathToFile(this.directory).then((f : AbstractInternalFile) => this.file = f);
		},
		file(newFile : AbstractInternalFile) {
			this.children = undefined;
			if (newFile && newFile.folder && (this.loadLevel > 0)) {
				const folder: InternalFolder = newFile as InternalFolder;

				folder.loadChildren().then(() => {
					this.children = folder.children;
				});
			}
		},
		children(newChildren?: AbstractInternalFile[]) {
			this.expanded = !!newChildren;
		},
		expanded(expanded: boolean) {
			if (expanded) {
				//Only load children if not already loaded
				if (!this.children) this.runLoadChildren();
			} else {
				this.children = undefined;
				if (this.file) {
					(this.file as InternalFolder).unloadChildren();
				}
			}
		}
	},
});
</script>


<style scoped>
.fileTree {
	text-align: left;
}

.fileTree .controls-holder {
	text-align: right;
	float: right;
}

.fileTree .child {
	text-align: left;
	user-select: none;
}

.fileTree .children {
	padding-left: 1em;
	border-left: 1px dotted black;
}

.fileTree .children .child.empty {
	font-style: italic;
}

.fileTree .collapse-icon {
	width: .5em;
	margin-right: .3em;
}
</style>
