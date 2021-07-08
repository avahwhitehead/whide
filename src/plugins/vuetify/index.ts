import Vue from 'vue';
import Vuetify, { UserVuetifyPreset } from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import { VuetifyThemeVariant } from "vuetify/types/services/theme";
import colors from 'vuetify/lib/util/colors'
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'

library.add(fas); // Include needed icons
Vue.component('FontAwesomeIcon', FontAwesomeIcon);

Vue.use(Vuetify);

let LIGHT_THEME: Partial<VuetifyThemeVariant> = {
	primary: '#3f51b5',
	secondary: '#b0bec5',
	accent: '#8c9eff',
	error: '#b71c1c',
};
let DARK_THEME: Partial<VuetifyThemeVariant> = {
	primary: colors.blue,
	secondary: colors.cyan, //'#FFFFFF',
	accent: colors.cyan, //'#FFFFFF',
	error: colors.red,
	// anchor: colors.cyan, //'#FFFFFF',
	info: colors.cyan, //'#FFFFFF',
	warning: colors.cyan, //'#FFFFFF',
	success: colors.cyan, //'#FFFFFF',
};

const vuetifyOpts: Partial<UserVuetifyPreset> = {
	theme: {
		dark: false,
		themes: {
			light: LIGHT_THEME,
			dark: DARK_THEME,
		}
	},
	icons: {
		// iconfont: 'faSvg',
		iconfont: 'faSvg',
		// component: FontAwesomeIcon,
	}
};

export default new Vuetify(vuetifyOpts);