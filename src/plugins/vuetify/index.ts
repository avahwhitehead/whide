import Vue from 'vue';
import Vuetify, { UserVuetifyPreset } from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import { VuetifyThemeVariant } from "vuetify/types/services/theme";
// import colors from 'vuetify/lib/util/colors';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";

Vue.use(Vuetify);

//TODO: Customise vuetify themes
//  https://stackoverflow.com/a/49851820/2966288
let LIGHT_THEME: Partial<VuetifyThemeVariant> = {

};
let DARK_THEME: Partial<VuetifyThemeVariant> = {

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
		iconfont: 'faSvg',
		//Fix for some icons not showing
		//See https://stackoverflow.com/a/64373929/2966288
		values: {
			radioOn: {
				component: FontAwesomeIcon,
				props: {
					icon: ['fa', 'dot-circle']
				}
			},
			radioOff: {
				component: FontAwesomeIcon,
				props: {
					icon: ['fa', 'circle']
				}
			},
		}
	}
};

export default new Vuetify(vuetifyOpts);