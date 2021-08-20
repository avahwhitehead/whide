import Vue from 'vue';
import Vuetify, { UserVuetifyPreset } from 'vuetify';
import 'vuetify/dist/vuetify.min.css';
import { VuetifyThemeVariant } from "vuetify/types/services/theme";
// import colors from 'vuetify/lib/util/colors';
//FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { faVuejs } from '@fortawesome/free-brands-svg-icons';
import { far } from '@fortawesome/free-regular-svg-icons';

//Make all icons available to FontAwesome
library.add(far, fas, faVuejs);
//Allow using FontAwesome component without import
Vue.component('FontAwesomeIcon', FontAwesomeIcon);
Vue.component('font-awesome-icon', FontAwesomeIcon);

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