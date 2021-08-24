<template>
	<v-dialog
		v-model="showDialog"
		persistent
		max-width="800px"
	>
		<v-card class="ma-0 pa-0 pt-2">
			{{ new_directory}}

			<v-divider/>

			<FilePicker
				:directory="picker_root_directory"
				hide-files
				@changeFolder="onFolderSelect"
			>
				<template v-slot:controls="">
					<v-btn
						depressed
						title="Parent directory"
						@click="parentDirChange"
					>
						<v-icon>fa-level-up-alt</v-icon>
					</v-btn>
					<v-spacer />
				</template>
			</FilePicker>

			<v-divider/>

			<v-card-actions class="actions-container">
				<v-spacer />

				<v-btn
					color="blue darken-1"
					text
					@click="showDialog = false"
					v-text="'close'"
				/>

				<v-btn
					color="blue darken-1"
					text
					@click="save()"
					v-text="'save'"
				/>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import FilePicker from "@/components/FilePicker.vue";
import path from "path";

interface DataTypeInterface {
	picker_root_directory: string;
	new_directory: string;
}

export default Vue.extend({
	name: 'ChangeRootPopup',
	components: {
		FilePicker
	},
	props: {
		value: Boolean,
	},
	data() : DataTypeInterface {
		return {
			new_directory: '',
			picker_root_directory: '',
		}
	},
	mounted() {
		this.new_directory = this.current_directory;
		this.picker_root_directory = this.current_directory;
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
		current_directory: {
			get(): string {
				return this.$store.state.current_directory;
			},
			set(cwd: string): void {
				this.$store.commit('cwd.set', cwd);
			},
		},
	},
	methods: {
		save(): void {
			this.current_directory = this.new_directory;
			this.showDialog = false;
		},
		onFolderSelect(directory: string): void {
			this.new_directory = directory;
		},
		parentDirChange(): void {
			this.picker_root_directory = path.resolve(this.picker_root_directory, '..');
			this.new_directory = this.picker_root_directory;
		}
	},
	watch: {
		value(): void {
			this.picker_root_directory = this.current_directory;
			this.new_directory = this.current_directory;
		},
	},
});
</script>


<style scoped>
.actions-container {
	border-top: 1px solid grey;
}
</style>
