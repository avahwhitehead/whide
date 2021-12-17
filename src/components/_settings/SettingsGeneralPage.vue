<template>
	<v-col>
		<div class="text-h4">
			<span>General</span>
		</div>

		<v-container>
			<v-form v-model="isFormValid" ref="form">
				<v-row>
					<v-text-field
						v-model="hwhilePath"
						label="Path to HWhile"
						class="ma-0 pa-0"
						required
						dense
						:rules="_hwhilePathRules"
					/>
					<v-btn
						depressed
						small
						title="Open file picker"
						@click="showFilePicker = true"
					>
						<v-icon>far fa-folder</v-icon>
					</v-btn>
				</v-row>
				<v-row class="mt-0">
					<small>This should be a path to the HWhile executable file, not its containing folder.</small>
					<small>Leave this blank to use HWhile on the global path.</small>
				</v-row>

				<v-row class="mt-5">
					<v-checkbox
						v-model="showAllHWhileOutput"
						dense
						label="Enable HWhile debug mode"
					/>
				</v-row>
				<v-row class="mt-0">
					<small>When disabled, certain HWhile commands are hidden to simplify the output.</small>
				</v-row>
			</v-form>
		</v-container>

		<FilePickerPopup
			v-model="showFilePicker"
			@change="onPathSelect"
			v-if="!$store.state.isElectron"
		/>
	</v-col>
</template>

<script lang="ts">
import Vue from "vue";
import FilePickerPopup from "@/components/FilePickerPopup.vue";
import * as fs from "fs";
import { OpenDialogReturnValue } from "electron";

const electron = (window['require'] !== undefined) ? require("electron") : undefined;

interface DataTypeInterface {
	showFilePicker: boolean;
}

export default Vue.extend({
	name: 'SettingsGeneralPage',
	components: {
		FilePickerPopup

	},
	props: {
		value: Boolean,
	},
	data() : DataTypeInterface {
		return {
			showFilePicker: false,
		}
	},
	mounted() {
		(this.$refs.form! as Vue & { validate: () => void }).validate();
	},
	computed: {
		hwhilePath: {
			get(): string {
				return this.$store.state.settings.general.hwhilePath;
			},
			set(hwhilePath: string): void {
				this.$store.commit('setHWhilePath', hwhilePath);
			}
		},
		showAllHWhileOutput: {
			get(): string {
				return this.$store.state.settings.general.showAllHWhileOutput;
			},
			set(val: boolean): void {
				this.$store.commit('hwhile.showAllOutput', val);
			}
		},
		isFormValid: {
			get(): boolean {
				return this.value;
			},
			set(val: boolean): void {
				this.$emit('input', val);
			}
		},
		_hwhilePathRules(): ((v: string) => string|true)[] {
			return [
				v => {
					//Empty input - use global hwhile
					if (!v) return true;
					//Make sure the file is valid
					if (!fs.existsSync(v)) return 'File does not exist';
					if (fs.statSync(v).isFile()) return true;
					return 'Select the HWhile executable file';
				},
			];
		},
	},
	methods: {
		onPathSelect(newPath: string) {
			this.hwhilePath = newPath;
		}
	},
	watch: {
		showFilePicker(showFilePicker): void {
			if (showFilePicker && electron) {
				electron.remote.dialog.showOpenDialog({
					filters: [
						{ name: 'All files', extensions: ['*'] },
					],
					properties: ['openFile'],
				}).then((result: OpenDialogReturnValue) => {
					this.onPathSelect(result.filePaths[0]);
				})
			}
		}
	},
});
</script>


<style scoped>

</style>
