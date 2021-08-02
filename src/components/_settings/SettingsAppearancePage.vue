<template>
	<v-col>
		<v-card-title class="pa-0">
			<span class="text-h5">Appearance</span>
		</v-card-title>

		<v-card-text>
			<v-form>
				<v-radio-group
					v-model="selectedTheme"
					label="Application theme:"
					dense
				>
					<v-radio label="Auto (OS default)" :value="THEME_AUTO" />
					<v-radio label="Light" :value="THEME_LIGHT" />
					<v-radio label="Dark" :value="THEME_DARK" />
				</v-radio-group>
			</v-form>
		</v-card-text>
	</v-col>
</template>

<script lang="ts">
import Vue from "vue";
import { APP_THEME } from "@/plugins/vuex";

interface DataTypeInterface {
	THEME_AUTO: APP_THEME;
	THEME_LIGHT: APP_THEME;
	THEME_DARK: APP_THEME;
}

export default Vue.extend({
	name: 'SettingsAppearancePage',
	components: {

	},
	data() : DataTypeInterface {
		return {
			THEME_AUTO: APP_THEME.AUTO,
			THEME_LIGHT: APP_THEME.LIGHT,
			THEME_DARK: APP_THEME.DARK,
		}
	},
	computed: {
		selectedTheme: {
			get(): APP_THEME {
				return this.$store.state.settings.appearance.theme;
			},
			set(theme: APP_THEME) {
				//Update the app theme
				this.$store.commit('setAppTheme', theme);
			}
		}
	},
	methods: {

	},
});
</script>


<style scoped>

</style>
