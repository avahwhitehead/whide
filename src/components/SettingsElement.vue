<template>
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

		<SettingsGeneralPage v-if="$store.state.isElectron && currentPage === 'HWhile'" />
		<SettingsAppearancePage v-else-if="currentPage === 'Appearance'" />
		<v-card v-else>
			<v-card-text>
				Choose a page from the list on the left.
			</v-card-text>
		</v-card>
	</v-row>
</template>

<script lang="ts">
import Vue from "vue";
import SettingsAppearancePage from "@/components/_settings/SettingsAppearancePage.vue";
import SettingsGeneralPage from "@/components/_settings/SettingsGeneralPage.vue";

interface DataTypeInterface {
	pageIndex: number;
	pagesList: string[];
	isGeneralValid: boolean;
}

export default Vue.extend({
	name: 'SettingsElement',
	components: {
		SettingsAppearancePage,
		SettingsGeneralPage,
	},
	data() : DataTypeInterface {
		return {
			pageIndex: 0,
			pagesList: [
				'Appearance',
				//Only show the General page if the app is running in electron
				//Currently this only has the HWhile path field
				...(this.$store.state.isElectron ? ['HWhile'] : []),
			],
			isGeneralValid: true,
		}
	},
	computed: {
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
.sidebar {
	border-right: 1px solid grey;
}
</style>
