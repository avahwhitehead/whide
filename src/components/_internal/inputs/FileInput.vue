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

		<transition name="fade">
			<div
				class="file-picker-container"
				v-if="open"
			>
				<FilePicker
					class="file-picker"
					:directory="vars.cwd"
					@change="onFileClick"
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
	vars: typeof vars;
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
		}
	},
	data(): DataTypeDescriptor {
		return {
			path: undefined,
			open: true,
			vars,
		};
	},
	mounted() {

	},
	methods: {
		onFileClick(file: AbstractInternalFile) {
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
		error(msg?: string) {
			this.$emit("error", msg);
		}
	},
	watch: {
		path(val?: AbstractInternalFile) {
			if (val) this.$emit('change', val.fullPath);
			else this.$emit('change', undefined);
		}
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

.selected-output {
	float: left;
	text-align: left;
}

.expand-button {
	text-align: right;
	color: blue;
	text-decoration: underline
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
