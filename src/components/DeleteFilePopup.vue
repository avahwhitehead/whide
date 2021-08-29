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
				<span>Delete File</span>
			</v-card-title>

			<v-divider />

			<v-card-text
				class="pa-0"
				style="min-height: 15em"
			>
				<FilePicker
					:directory="directory"
					@change="onPathSelect"
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
				<span class="font-weight-bold">Delete: </span>
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
					@click="confirmDelete()"
					v-text="'Delete'"
				/>
			</v-card-actions>

		<v-dialog
			v-model="showConfirmPopup"
			max-width="500px"
		>
			<v-card>
				<v-card-title>
					Confirm delete
				</v-card-title>

				<v-card-text>
					<div>
						Confirm deleting {{ isFolder ? 'folder' : 'file '}} "<b v-text="fileDisplayName" />"
					</div>
				</v-card-text>

				<v-divider/>

				<v-card-actions class="actions-container">
					<v-spacer />

					<v-btn
						color="blue darken-1"
						text
						@click="showConfirmPopup = false"
						v-text="'No'"
					/>

					<v-btn
						color="blue darken-1"
						text
						@click="runDelete()"
						v-text="'Yes'"
					/>
				</v-card-actions>
			</v-card>
		</v-dialog>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import FilePicker from "@/components/FilePicker.vue";
import path from "path";
import { fs } from "@/files/fs"

interface DataTypeInterface {
	directory: string;
	filePath: string|undefined;
	showConfirmPopup: boolean;
}

export default Vue.extend({
	name: 'DeleteFilePopup',
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
		isFolder(): boolean {
			if (!this.filePath) return false;
			return fs.statSync(this.filePath).isDirectory();
		},
		fileDisplayName(): string {
			if (!this.filePath) return '';
			return path.basename(this.filePath);
		},
	},
	methods: {
		confirmDelete(): void {
			//Show the confirm deletion popup
			this.showConfirmPopup = true;
		},
		async runDelete(): Promise<void> {
			//Check the file exists
			if (!this.filePath || !fs.existsSync(this.filePath)) return;
			//Delete the file
			if (this.isFolder) {
				await fs.promises.rmdir(this.filePath);
			} else {
				await fs.promises.unlink(this.filePath);
			}
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
