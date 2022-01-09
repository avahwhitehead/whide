<template>
	<v-dialog v-model="value" max-width="60%" persistent>
		<v-card>
			<v-card-title>
				Save As
			</v-card-title>

			<v-card-text>
				<v-form ref="form" v-model="isFormValid" @submit.prevent="onSaveClick">
					<v-row>
						<v-text-field
							v-model="fileModel"
							label="Program"
							placeholder="/program.while"
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
					<v-row v-if="showMakeFolderWarning">
						<v-icon class="warning-triangle warning--text">fa-exclamation-triangle</v-icon>
						The folder "{{ fileParent }}" doesn't exist and will be created
					</v-row>
				</v-form>
			</v-card-text>

			<v-card-actions>
				<v-btn @click="onCancelClick">Cancel</v-btn>

				<v-spacer />

				<v-btn @click="onSaveClick" :disabled="!isFormValid">Save</v-btn>
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
import path from "path";

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
	mounted(): void {
		this.fileModel = this.defaultFileModelValue;
		//@ts-ignore
		this.$refs.form?.validate();
	},
	computed: {
		fileInputRules(): ((v: string) => boolean|string)[] {
			return [
				this.rule_requireNonEmpty,
				this.rule_fileNotDirectory,
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
		},
		cwd(): string {
			return this.$store.state.current_directory;
		},
		fileParent(): string {
			return path.dirname(this.fileModel + '.');
		},
		showMakeFolderWarning(): boolean {
			try {
				return !fs.existsSync(this.fileParent);
			} catch (e) {
				return false;
			}
		},
		defaultFileModelValue(): string {
			return path.join(this.cwd, 'prog.while');
		}
	},
	methods: {
		onCancelClick(): void {
			this.$emit('change', undefined);
			this.isDialogVisible = false;
		},
		onSaveClick(): void {
			this.fileModel = this._fileSaveName(this.fileModel);
			this.$emit('change', this.fileModel);
			this.isDialogVisible = false;
		},
		onPathSelect(p: string): void {
			this.fileModel = p;
		},
		_fileSaveName(filename: string) {
			if (path.extname(filename) === '') filename += '.while';
			if (!path.isAbsolute(filename)) filename = path.resolve(this.cwd, filename);
			return filename;
		},
		rule_requireNonEmpty(val: string): boolean|string {
			return val.replaceAll(/\s+/g, '') !== '' || "Enter a value";
		},
		rule_fileNotDirectory(val: string): boolean|string {
			const a = val.charAt(val.length - 1);
			return !['/', '\\'].includes(a) || "Enter a file name";
		},
		rule_fileNotExists(val: string): boolean|string {
			val = this._fileSaveName(val);
			return !fs.existsSync(val) || `File "${val}" already exists`;
		},
	},
	watch: {
		value(isVisible: boolean): void {
			if (isVisible) {
				this.fileModel = this.defaultFileModelValue;
				this.filePickerModel = '';
				//@ts-ignore
				this.$refs.form?.validate();
			}
		}
	},
});
</script>

<style scoped>
.warning-triangle {
	font-size: 20px !important;
}
</style>
