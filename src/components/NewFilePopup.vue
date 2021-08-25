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
				<span>New File</span>
			</v-card-title>

			<v-form ref="form" v-model="isFormValid">
				<v-row>
					<v-col>
						<v-text-field
							label="program name"
							v-model="fileName"
							:rules="[validation_filename]"
						/>
					</v-col>
					<v-col cols="3" v-if="!createFolder">
						<v-combobox
							v-model="fileExtension"
							:items="['while']"
							label="File extension"
							disable-lookup
							chips
							small-chips
							open-on-clear
							:rules="[validation_fileext]"
						/>
					</v-col>
				</v-row>

				<v-divider />

				<v-card-text
					class="pa-0"
					style="min-height: 15em"
				>
					<FilePicker
						:directory="directory"
						@changeFolder="onFolderSelect"
						hide-files
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
					<span class="font-weight-bold">New {{ createFolder ? 'folder' : 'file' }}: </span>
					<span>{{ full_path }}</span>
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
						:disabled="!isFormValid"
						text
						@click="save()"
						v-text="'Create'"
					/>
				</v-card-actions>
			</v-form>
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
	fileName: string;
	fileExtension: string;
	isFormValid: boolean;
}

const DEFAULT_FILE_NAME = 'prog';
const DEFAULT_FOLDER_NAME = 'myfolder';

export default Vue.extend({
	name: 'ChangeRootPopup',
	components: {
		FilePicker
	},
	props: {
		value: Boolean,
		createFolder: {
			type: Boolean,
			default: false,
		}
	},
	data() : DataTypeInterface {
		return {
			fileName: DEFAULT_FILE_NAME,
			fileExtension: 'while',
			directory: '',
			isFormValid: true,
		}
	},
	mounted() {
		this.directory = this.current_directory;
		if (this.createFolder) {
			this.fileName = DEFAULT_FOLDER_NAME;
		} else {
			this.fileName = DEFAULT_FILE_NAME;
		}
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
		full_path(): string {
			let fullname: string = this.fileName || '';

			if (!this.createFolder) fullname += '.' + (this.fileExtension || '');

			let fullpath = path.resolve(this.directory, fullname);
			if (this.createFolder) {
				fullpath += '/';
			}
			return fullpath;
		},
	},
	methods: {
		async save(): Promise<void> {
			//Check the file doesn't already exist
			if (fs.existsSync(this.full_path)) return;

			if (this.createFolder) {
				//Create a folder
				await fs.promises.mkdir(this.full_path);
			} else {
				//Create a file
				await fs.promises.writeFile(this.full_path, '');
			}

			//Hide the popup
			this.showDialog = false;
		},
		onFolderSelect(directory: string): void {
			this.directory = directory;
		},
		parentDirChange(): void {
			this.directory = path.resolve(this.directory, '..');
		},
		
		validation_filename(): true|string {
			if (!this.fileName) return 'Enter a file name';

			if (fs.existsSync(this.full_path)) {
				return 'That file already exists';
			}
			return true;
		},
		validation_fileext(): true|string {
			return this.fileExtension ? true : 'Enter a file extension';
		},
	},
	watch: {
		showDialog(showDialog: boolean): void {
			if (showDialog) {
				if (this.createFolder) this.fileName = DEFAULT_FOLDER_NAME;
				else this.fileName = DEFAULT_FILE_NAME;

				this.fileExtension = 'while';
				this.directory = this.current_directory;
				this.$nextTick(() => {
					(this.$refs.form! as HTMLElement & {validate: () => void}).validate();
				})
			}
		},
		directory() {
			(this.$refs.form! as HTMLElement & {validate: () => void}).validate();
		}
	},
});
</script>


<style scoped>

</style>
