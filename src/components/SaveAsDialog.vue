<template>
	<v-dialog v-model="value" max-width="60%">
		<v-card>
			<v-card-title>
				Save As
			</v-card-title>

			<v-card-text>
				<v-form ref="form" v-model="isFormValid">
					<v-row>
						<v-text-field
							v-model="fileModel"
							label="Program"
							required
							:rules="fileInputRules"
						/>
						<v-btn
							depressed
							class="off-black"
							title="Choose program"
							@click="showFilePicker = true"
						>
							<v-icon>fa-folder</v-icon>
						</v-btn>
					</v-row>
				</v-form>
			</v-card-text>

			<v-card-actions>
				<v-btn @click="onCancelClick">Cancel</v-btn>

				<v-spacer />

				<v-btn @click="onSaveClick">Save</v-btn>
			</v-card-actions>
		</v-card>

		<FilePickerPopup
			v-model="showFilePicker"
			@change="onPathSelect"
			v-if="!$store.state.isElectron"
		/>
	</v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import FilePickerPopup from "@/components/FilePickerPopup.vue";
import { fs } from "@/files/fs";
import { OpenDialogReturnValue } from "electron";

const electron = (window['require'] !== undefined) ? require("electron") : undefined;

type DataTypeInterface = {
	fileModel: string,
	isFormValid: boolean,

	showFilePicker: boolean,
	filePickerModel: string,
};

export default Vue.extend({
	name: 'SaveAsDialog',
	components: {
		FilePickerPopup,
	},
	props: {
		value: Boolean,
	},
	data() : DataTypeInterface {
		return {
			fileModel: '',
			isFormValid: true,

			showFilePicker: false,
			filePickerModel: '',
		}
	},
	computed: {
		fileInputRules(): ((v: string) => boolean|string)[] {
			return [
				this.rule_requireNonEmpty,
				this.rule_fileNotExists,
			];
		},
		isDialogVisible: {
			get(): boolean {
				return this.value;
			},
			set(val: boolean): void {
				this.$emit('input', val);
			},
		}
	},
	methods: {
		onCancelClick(): void {
			this.$emit('change', undefined);
			this.isDialogVisible = false;
		},
		onSaveClick(): void {
			this.$emit('change', this.fileModel);
			this.isDialogVisible = false;
		},
		onPathSelect(p: string): void {
			this.fileModel = p;
		},
		rule_requireNonEmpty(val: string): boolean|string {
			return val.replaceAll(/\s+/g, '') !== '' || "Enter a value";
		},
		rule_fileNotExists(val: string): boolean|string {
			return !fs.existsSync(val) || "File must not exist"
		},
	},
	watch: {
		showFilePicker(showFilePicker: boolean): void {
			if (showFilePicker && electron) {
				electron.remote.dialog.showOpenDialog({
					filters: [
						{ name: 'WHILE files', extensions: ['while'] },
						{ name: 'All files', extensions: ['*'] },
					],
					properties: ['openFile'],
				}).then((result: OpenDialogReturnValue) => {
					this.onPathSelect(result.filePaths[0]);
				})
			}
		},
	},
});
</script>

<style scoped>

</style>
