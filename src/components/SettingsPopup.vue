<template>
	<v-dialog
		v-model="showDialog"
		persistent
		scrollable
		max-width="800px"
	>
		<v-card height="400px">
			<SettingsElement />

			<v-card-actions class="actions-container">
				<v-spacer />

				<v-btn
					color="blue darken-1"
					:disabled="!areSettingsValid"
					text
					@click="showDialog = false"
					v-text="'Save'"
				/>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import SettingsElement from "@/components/SettingsElement.vue";

interface DataTypeInterface {
	pageIndex: number;
	pagesList: string[];
	isGeneralValid: boolean;
}

export default Vue.extend({
	name: 'SettingsPopup',
	components: {
		SettingsElement,
	},
	props: {
		value: Boolean,
	},
	data() : DataTypeInterface {
		return {
			pageIndex: 0,
			pagesList: [
				'General',
				'Appearance',
			],
			isGeneralValid: true,
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
		currentPage: {
			get(): string {
				return this.pagesList[this.pageIndex];
			},
			set(val: string): void {
				this.pageIndex = this.pagesList.indexOf(val);
			}
		},
		areSettingsValid(): boolean {
			return this.isGeneralValid;
		},
	},
});
</script>


<style scoped>
.actions-container {
	border-top: 1px solid grey;
}
</style>
