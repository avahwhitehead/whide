<template>
	<v-app id="app">
		<v-main>
			<router-view></router-view>
		</v-main>
	</v-app>
</template>

<script lang="ts">
import Vue from "vue";
import { APP_THEME } from "@/plugins/vuex";
import '@fortawesome/fontawesome-free/css/all.css';

//Check whether the user's browser explicitly requests light or dark theme
let darkThemeCheckQuery = window.matchMedia('(prefers-color-scheme: dark)');
let lightThemeCheckQuery = window.matchMedia('(prefers-color-scheme: light)');

export default Vue.extend({
	name: 'app',
	methods: {
		updateTheme(theme: APP_THEME): void {
			if (theme === APP_THEME.AUTO) {
				//Listen for updates in requested theme
				darkThemeCheckQuery.addEventListener('change', this.darkThemeQueryHandler);
				lightThemeCheckQuery.addEventListener('change', this.lightThemeQueryHandler);

				if (darkThemeCheckQuery.matches) {
					//Dark theme requested
					this.$vuetify.theme.dark = true;
				} else if (lightThemeCheckQuery.matches) {
					//Light theme requested
					this.$vuetify.theme.dark = false;
				}
				//Otherwise stick with current theme
			} else {
				//Stop listening for theme updates
				darkThemeCheckQuery.removeEventListener('change', this.darkThemeQueryHandler);
				lightThemeCheckQuery.removeEventListener('change', this.lightThemeQueryHandler);
				//Switch to either light or dark theme
				this.$vuetify.theme.dark = (theme === APP_THEME.DARK);
			}
		},
		lightThemeQueryHandler(event: MediaQueryListEvent) {
			this.$vuetify.theme.dark = !event.matches;
		},
		darkThemeQueryHandler(event: MediaQueryListEvent) {
			this.$vuetify.theme.dark = event.matches;
		},
	},
	created() {
		//Start the app in the requested theme
		this.updateTheme(this.$store.state.settings.appearance.theme);
	},
	computed: {
		currentTheme(): APP_THEME {
			return this.$store.state.settings.appearance.theme;
		}
	},
	watch: {
		currentTheme(theme: APP_THEME) {
			this.updateTheme(theme);
		}
	}
});
</script>

<!--suppress CssUnusedSymbol -->
<style>
@import "../styles/v-tooltip.css";

#app {
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
}

#app {
	display: flex;
	flex-direction: column;

	height: 100%;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}
</style>