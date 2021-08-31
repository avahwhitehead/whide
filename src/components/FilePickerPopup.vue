<template>
	<v-dialog
		v-model="showDialog"
		persistent
		max-width="800px"
		scrollable
	>
		<v-card class="pa-3" max-height="600px">
			<v-card-title>
				<span>Choose File</span>
			</v-card-title>

			<v-divider />

			<v-card-text
				class="pa-0"
				style="min-height: 15em"
			>
				<FilePicker
					:directory="filePickerDirectory"
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
				<span>{{ fileModel }}</span>
			</div>

			<v-divider/>

			<v-card-actions>
				<v-spacer />

				<v-btn
					color="blue darken-1"
					text
					@click="showDialog = false"
					v-text="'Cancel'"
				/>

				<v-btn
					color="blue darken-1"
					:disabled="!fileModel"
					@click="filePickerChooseClick()"
					text
					v-text="'Choose'"
				/>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import FilePicker from "@/components/FilePicker.vue";
import path from "path";

type DataTypeInterface = {
	filePickerDirectory: string,
	fileModel: string,
};

export default Vue.extend({
	components: {
		FilePicker
	},
	props: {
		value: Boolean,
	},
	data() : DataTypeInterface {
		return {
			filePickerDirectory: this.$store.state.current_directory,
			fileModel: '',
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
	},
	mounted() {

	},
	methods: {
		onPathSelect(p: string): void {
			this.fileModel = p;
		},
		parentDirChange(): void {
			this.filePickerDirectory = path.resolve(this.filePickerDirectory, '..');
		},
		filePickerChooseClick(): void {
			this.$emit('change', this.fileModel);
			this.showDialog = false;
		}
	},
	watch: {
	},
});
</script>


<style scoped>

</style>
