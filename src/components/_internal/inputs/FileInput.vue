<template>
	<div class="FileInputElement">
		<p class="description-holder">
			<span class="name" v-if="name">{{ name }}:&nbsp;</span>
			<span class="description" v-if="description" v-text="description" />
		</p>

		<div>
			<span v-if="selected">Selected:&nbsp;{{ selected.fullPath }}</span>
			<span v-else>
				Pick a
				<span v-if="type === 'file'">file</span>
				<span v-else-if="type === 'folder'">folder</span>
				<span v-else>file or folder</span>:
			</span>

			<div
				class="expand-button"
				@click="open = !open"
				v-text="`(${open ? 'hide' : 'show'} file picker)`"
			/>
		</div>

		<div class="path-input-holder">
			<v-text-field
				class="path-input pt-0 pr-2"
				v-model="dirModel"
				placeholder="File path"
				@keydown.enter="dirInputChoose"
			/>

			<v-btn
				@click="dirInputChoose"
				class="choose-dir-button"
				depressed
			>
				Choose
			</v-btn>
		</div>

		<div class="error" v-text="error" v-if="error" />

		<v-divider />

		<transition name="fade">
			<div
				class="file-picker-container"
				v-if="open"
			>
				<FilePicker
					class="file-picker"
					:directory="dir"
					@change="onFileClick"
					@dir="onFilePickerRootChange"
				/>
			</div>
		</transition>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import { AbstractInternalFile, pathToFile } from "@/files/InternalFile";
import FilePicker from "@/components/FilePicker.vue";

interface DataTypeDescriptor {
	selected?: AbstractInternalFile;
	open: boolean;
	dir: string;
	error?: string;
	dirModel: string;
}

export default Vue.extend({
	name: 'FileInputElement',
	components: {
		FilePicker,
	},
	props: {
		name: {
			type: String,
		},
		type: {
			type: String as PropType<'path'|'file'|'folder'>,
			default: 'path',
		},
		description: {
			type: String,
			required: false,
		},
		value: {
			type: String,
			required: false,
		},
	},
	data(): DataTypeDescriptor {
		return {
			selected: undefined,
			open: true,
			error: undefined,
			dir: this.$store.state.current_directory,
			dirModel: this.$store.state.current_directory,
		};
	},
	mounted() {
		this.dir = this.value || this.$store.state.current_directory;
	},
	methods: {
		onFileClick(file: AbstractInternalFile) {
			//Show the file path in the input when the user clicks
			this.dirModel = file.fullPath;

			if (this.type === "path") {
				//Allow any existing path
				this.selected = file;
			} else if (this.type === "file") {
				//Require a file
				if (file.file) this.selected = file;
				this.$emit("error", file.file ? '' : "You must select a file");
			} else if (this.type === "folder") {
				//Require a folder
				if (file.folder) this.selected = file;
				this.$emit("error", file.folder ? '' : "You must select a folder");
			}
		},
		async onFilePickerRootChange(root: string) {
			this.dir = root;
		},
		dirInputChoose() {
			this.dir = this.dirModel;
		}
	},
	watch: {
		selected(selected?: AbstractInternalFile) {
			this.$emit('change', selected ? selected.fullPath : undefined);
		},
		value(value?: string) {
			this.dir = value || this.$store.state.current_directory;
		},
		dir: {
			immediate: true,
			async handler(dir: string) {
				if (this.type === 'folder' || this.type === 'path') {
					this.selected = await pathToFile(dir);
				}
			}
		},
	}
})
</script>


<style scoped>
.FileInputElement {
	text-align: left;
}

.description-holder {
	/*margin: 5px 0;*/
}
.description-holder .name {
	font-weight: bold;
}

.error {
	color: red;
}

.selected-output {
	/*float: left;*/
	/*text-align: left;*/
}

.expand-button {
	float: right;
	color: blue;
	text-decoration: underline;
}

.path-input-holder {
	display: flex;
	/*width: 100%;*/
	/*flex: 1;*/
	flex-direction: row;
}

.path-input {
	flex: 1;
	vertical-align: bottom;
}

.choose-path-btn {
	/*flex-grow: 0;*/
	flex-grow: 0;
	vertical-align: bottom;
}

.file-picker-container {
	/*overflow-y: auto;*/
	/*padding: 5px;*/
	/*Only show top/bottom borders*/
	border: solid black;
	border-width: 1px 0;
}

.file-picker, .fade-enter-active, .fade-leave-active {
	/*Fixed height*/
	height: 10em;
	/*Don't show the scrollbar when fading*/
	overflow-y: hidden;
}

.file-picker {
	/*Override the collapsing scrollbar settings*/
	overflow-y: auto;
}

.fade-enter-active, .fade-leave-active {
	transition: all .2s cubic-bezier(0, 0, 0, 0);
}
.fade-enter, .fade-leave-to {
	transform: scaleY(0) translateZ(0);
	height: 0;
}
</style>
