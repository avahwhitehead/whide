<template>
	<div class="FileInputElement">
		<p class="description-holder">
			<span class="name" v-if="name">{{ name }}:&nbsp;</span>
			<span class="description" v-if="description" v-text="description" />
		</p>

		<div>
			<div class="selected-output">
				<span v-if="path">Selected:&nbsp;{{ path.fullPath }}</span>
				<span v-else>
					Pick a
					<span v-if="type === 'file'">file</span>
					<span v-else-if="type === 'folder'">folder</span>
					<span v-else>file or folder</span>:
				</span>
			</div>

			<div
				class="expand-button"
				@click="open = !open"
				v-text="`(${open ? 'hide' : 'show'} file picker)`"
			/>
		</div>

		<div class="path-input-holder">
			<label>
				<input
					class="path-input"
					v-model="dirModel"
					placeholder="File path"
					@keydown.enter="dirInputChoose"
				/>
				<button @click="dirInputChoose">Choose</button>
			</label>
			<div class="error" v-text="error" v-if="error" />
		</div>

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
import { AbstractInternalFile } from "@/files/InternalFile";
import FilePicker from "@/components/FilePicker.vue";
import { vars } from '@/utils/globals';

interface DataTypeDescriptor {
	path?: AbstractInternalFile;
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
			path: undefined,
			open: true,
			error: undefined,
			dir: vars.cwd,
			dirModel: vars.cwd,
		};
	},
	mounted() {
		this._onValueChange(this.value);
	},
	methods: {
		onFileClick(file: AbstractInternalFile) {
			//Show the file path in the input when the user clicks
			this.dirModel = file.fullPath;

			if (this.type === "path") {
				//Allow any existing path
				this.path = file;
			} else if (this.type === "file") {
				//Require a file
				if (file.file) this.path = file;
				this.$emit("error", file.file ? '' : "You must select a file");
			} else if (this.type === "folder") {
				//Require a folder
				if (file.folder) this.path = file;
				this.$emit("error", file.folder ? '' : "You must select a folder");
			}
		},
		_onValueChange(val?: string) {
			this.dir = val || vars.cwd;
		},
		onFilePickerRootChange(root: string) {
			this.dir = root;
		},
		dirInputChoose() {
			this.dir = this.dirModel;
		}
	},
	watch: {
		path(val?: AbstractInternalFile) {
			if (val) this.$emit('change', val.fullPath);
			else this.$emit('change', undefined);
		},
		value(val?: string) {
			this._onValueChange(val);
		},
	}
})
</script>


<!--suppress CssUnusedSymbol -->
<style scoped>
.description-holder {
	margin: 5px 0;
}
.description-holder .name {
	font-weight: bold;
}

.error {
	color: red;
}

.selected-output {
	float: left;
	text-align: left;
}

.expand-button {
	text-align: right;
	color: blue;
	text-decoration: underline
}

.path-input-holder, .path-input-holder label {
	display: flex;
	width: 100%;
	flex: 1;
	flex-direction: row;
}

.path-input {
	flex: 1;
}

.file-picker-container {
	overflow-y: auto;
	padding: 5px;
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
