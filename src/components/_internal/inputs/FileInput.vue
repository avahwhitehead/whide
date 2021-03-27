<template>
	<div class="FileInputElement">
		<div v-text="name" />

		<div>
			<span v-if="path">Selected:&nbsp; {{ path.fullPath }}</span>
			<span v-else>No file selected</span>
		</div>

		<div
			class="expand-button"
			@click="open = !open"
			v-text="`(${open ? 'collapse' : 'expand'})`"
		/>

		<transition name="fade">
			<FilePicker
				v-if="open"
				class="file-picker"
				:directory="vars.cwd"
				@change="onFileClick"
			/>
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
	},
	data(): DataTypeDescriptor {
		return {
			path: undefined,
			open: false,
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
				else this.$emit("error", "You must select a file");
			} else if (this.type === "folder") {
				//Require a folder
				if (file.folder) this.path = file;
				else this.$emit("error", "You must select a folder");
			}
		},
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
.expand-button {
	color: blue;
	text-decoration: underline
}

.file-picker, .fade-enter-active, .fade-leave-active {
	height: 20em;
}

.fade-enter-active, .fade-leave-active {
	transition: all .2s cubic-bezier(0, 0, 0, 0);
}
.fade-enter, .fade-leave-to {
	transform: scaleY(0) translateZ(0);
	height: 0;
}
</style>
