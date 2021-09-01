<template>
	<v-dialog
		v-model="showDialog"
		persistent
		scrollable
		height="500px"
		max-width="800px"
	>
		<v-card class="pa-3">
			<v-card-title>
				<span>Export File</span>
			</v-card-title>

			<v-divider />

			<v-card-text
				class="pa-0"
				style="min-height: 15em"
			>
				<FilePicker
					:directory="directory"
					@changeFile="onPathSelect"
				>
					<template v-slot:controls="">
						<v-btn
							depressed
							title="Parent directory"
							@click="parentDirChange"
							width="1em"
							height="2em"
						>
							<v-icon>fa-level-up-alt</v-icon>
						</v-btn>
						<v-spacer />
					</template>
				</FilePicker>
			</v-card-text>

			<v-divider/>

			<div style="text-align: left">
				<span class="font-weight-bold">File: </span>
				<span>{{ filePath }}</span>
			</div>

			<v-divider/>

			<v-card-actions class="actions-container">
				<v-spacer />

				<v-btn
					color="blue darken-1"
					text
					@click="showDialog = false"
					v-text="'Cancel'"
				/>

				<v-btn
					color="blue darken-1"
					:disabled="!filePath"
					text
					@click="downloadFile()"
					v-text="'Download'"
				/>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import FilePicker from "@/components/FilePicker.vue";
import path from "path";
import { fs } from "@/files/fs"
import fileDownloader from "js-file-download";

interface DataTypeInterface {
	directory: string;
	filePath: string|undefined;
	showConfirmPopup: boolean;
}

export default Vue.extend({
	components: {
		FilePicker
	},
	props: {
		value: Boolean,
	},
	data() : DataTypeInterface {
		return {
			directory: this.$store.state.current_directory,
			filePath: undefined,
			showConfirmPopup: false,
		}
	},
	mounted() {
		this.directory = this.current_directory;
	},
	computed: {
		showDialog: {
			get(): boolean {
				return this.value;
			},
			set(value: boolean): void {
				this.$emit('input', value);
			}
		},
		current_directory(): string {
			return this.$store.state.current_directory;
		},
	},
	methods: {
		downloadFile(): void {
			if (!this.filePath) return;
			let content = fs.readFileSync(this.filePath);
			fileDownloader(content, path.basename(this.filePath));
			//Hide the popup
			this.showDialog = false;
		},
		onPathSelect(p: string): void {
			this.filePath = p;
		},
		parentDirChange(): void {
			this.directory = path.resolve(this.directory, '..');
		},
	},
	watch: {
		showDialog(showDialog: boolean): void {
			if (showDialog) {
				this.directory = this.current_directory;
			}
		},
	},
});
</script>


<style scoped>

</style>
