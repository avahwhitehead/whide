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
						:rules="_hwhilePathRules"
					/>
					<v-btn
						depressed
						title="Open file picker"
						@click="showFilePicker = true"
					>
						<v-icon>far fa-folder</v-icon>
					</v-btn>
				</v-row>
			</v-form>
		</v-container>

		<FilePickerPopup v-model="showFilePicker" @change="onPathSelect" />
	</v-col>
</template>

<script lang="ts">
import Vue from "vue";
import FilePickerPopup from "@/components/FilePickerPopup.vue";
import * as fs from "fs";

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
					if (!v) return true;
					return fs.existsSync(v) || 'File does not exist';
				}
			];
		},
	},
	methods: {
		onPathSelect(newPath: string) {
			this.hwhilePath = newPath;
		}
	}
});
</script>


<style scoped>

</style>
