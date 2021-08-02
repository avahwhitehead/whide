<template>
	<v-dialog
		v-model="showDialog"
		persistent
		max-width="800px"
	>
		<v-card class="ma-0 pa-0 pt-2">
			<v-row class="ma-0">
				<v-col cols="2" class="sidebar text-body-2 pa-0">
					<v-list dense>
						<v-list-item-group v-model="pageIndex" mandatory>
							<v-list-item v-for="(setting, i) in pagesList" :key="i">
								<v-list-item-content>
									<v-list-item-title v-text="setting" />
								</v-list-item-content>
							</v-list-item>
						</v-list-item-group>
					</v-list>
				</v-col>

				<SettingsGeneralPage v-if="currentPage === 'General'" />
				<SettingsAppearancePage v-else-if="currentPage === 'Appearance'" />
				<v-card v-else>
					<v-card-text>
						Choose a page from the list on the left.
					</v-card-text>
				</v-card>
			</v-row>

			<v-card-actions class="actions-container">
				<v-spacer />

				<v-btn
					color="blue darken-1"
					text
					@click="showDialog = false"
					v-text="'close'"
				/>
			</v-card-actions>
		</v-card>
	</v-dialog>
</template>

<script lang="ts">
import Vue from "vue";
import SettingsAppearancePage from "@/components/_settings/SettingsAppearancePage.vue";
import SettingsGeneralPage from "@/components/_settings/SettingsGeneralPage.vue";

interface DataTypeInterface {
	pageIndex: number;
	pagesList: string[];
}

export default Vue.extend({
	name: 'SettingsPopup',
	components: {
		SettingsAppearancePage,
		SettingsGeneralPage,
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
			]
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
	},
	mounted() {

	},
	methods: {

	},
	watch: {

	},
});
</script>


<style scoped>
.actions-container {
	border-top: 1px solid grey;
}

.sidebar {
	border-right: 1px solid grey;
}
</style>
