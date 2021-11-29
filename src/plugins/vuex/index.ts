import Vue from 'vue'
import Vuex from 'vuex';
import { RunConfiguration } from "@/types/RunConfiguration";
import VuexPersistence from "vuex-persist";
import createMutationsSharer from "vuex-shared-mutations";
import { FileInfoState } from "@/types/FileInfoState";
import { AbstractRunner } from "@/run/AbstractRunner";

//Make VueX available to Vue
Vue.use(Vuex);

/**
 * The possible values for the application theme.
 * "Auto" uses the browser default theme (as defined in the MediaQuery).
 */
export enum APP_THEME {
	AUTO,
	LIGHT,
	DARK,
}

/**
 * Type definitions for the VueX store
 */
export interface RootState {
	runConfigurations: RunConfiguration[];
	chosenRunConfig: RunConfiguration|undefined;
	settings: SettingsState;
	openFiles: FileInfoState[];
	breakpoints: {line: number, prog: string}[];
	focusedFile: number;
	current_directory: string|undefined;
	isElectron: boolean;
	programRunners: {name:string, runner:AbstractRunner}[],
}

/**
 * Root state object for application settings
 */
export interface SettingsState {
	general: SettingsGeneralState;
	appearance: SettingsAppearanceState;
}

/**
 * State object for general application settings
 */
export interface SettingsGeneralState {
	hwhilePath: string;
	showAllHWhileOutput: boolean;
}

/**
 * State object for application appearance settings
 */
export interface SettingsAppearanceState {
	/**
	 * Current application theme
	 */
	theme: APP_THEME;
}

//Automatically save the VueX store in the browser localstorage
const vuexLocal = new VuexPersistence<RootState>({
	storage: window.localStorage,
	reducer(state: RootState): Partial<RootState> {
		return {
			settings: state.settings,
			chosenRunConfig: state.chosenRunConfig,
			runConfigurations: state.runConfigurations,
			current_directory: state.current_directory,
		};
	},
})

//The VueX store object
const store = new Vuex.Store<RootState>({
	state: {
		runConfigurations: [],
		chosenRunConfig: undefined,
		settings: {
			general: {
				hwhilePath: '',
				showAllHWhileOutput: false,
			},
			appearance: {
				theme: APP_THEME.AUTO,
			}
		},
		openFiles: [],
		focusedFile: -1,
		current_directory: undefined,
		isElectron: (window['require'] !== undefined),
		breakpoints: [],
		programRunners: [],
	},
	mutations: {
		/**
		 * Add a new run configuration to the list
		 * @param state		VueX state object
		 * @param config	Run configuration object to add
		 */
		addRunConfig(state: RootState, config: RunConfiguration): void {
			state.runConfigurations.push(config);
			//Mark this run config as selected if there are no other selected ones
			if (state.chosenRunConfig === undefined) state.chosenRunConfig = config;
		},
		/**
		 * Remove a run configuration from the list
		 * @param state		VueX state object
		 * @param config	Run configuration object to remove
		 */
		removeRunConfig(state: RootState, config: RunConfiguration|number): void {
			//Get the index of the object and remove it from the list
			if (typeof config !== 'number') config = state.runConfigurations.indexOf(config);
			let deleted: RunConfiguration[] = state.runConfigurations.splice(config, 1);

			if (state.chosenRunConfig === undefined) return;
			//Update the selected run configuration if necessary
			if (state.runConfigurations.length === 0) {
				state.chosenRunConfig = undefined;
			} else if (deleted.includes(state.chosenRunConfig)) {
				let index = Math.min(config, state.runConfigurations.length - 1);
				state.chosenRunConfig = state.runConfigurations[index];
			}
		},
		overwriteRunConfig(state: RootState, [configIndex, newConfig]: [number, RunConfiguration]): void {
			let oldConfig = state.runConfigurations[configIndex];
			if (oldConfig === undefined) return;
			//Replace the old run config with the new one
			state.runConfigurations.splice(configIndex, 1, newConfig);
			//Update the chosen run config if that is the overwritten one
			if (oldConfig === state.chosenRunConfig) {
				state.chosenRunConfig = newConfig;
			}
		},

		setChosenRunConfig(state: RootState, config: RunConfiguration) {
			state.chosenRunConfig = config;
		},

		/**
		 * Change the app's global theme
		 * @param state	VueX state object
		 * @param theme	New theme to apply
		 */
		setAppTheme(state: RootState, theme: APP_THEME) {
			state.settings.appearance.theme = theme;
		},

		/**
		 * Change the saved path to the HWhile executable
		 * @param state			VueX state object
		 * @param hwhilePath	New path to HWhile
		 */
		setHWhilePath(state: RootState, hwhilePath: string) {
			state.settings.general.hwhilePath = hwhilePath;
		},

		'openFiles.set': function (state: RootState, files: FileInfoState[]) {
			state.openFiles = [...files];
		},
		'openFiles.setFocused': function (state: RootState, file: number|FileInfoState) {
			if (typeof file === 'number') state.focusedFile = file;
			else state.focusedFile = state.openFiles.indexOf(file);
		},
		'openFiles.focused.setExtended': function (state: RootState, isExt: boolean) {
			if (state.focusedFile >= 0) state.openFiles[state.focusedFile].extWhile = isExt;
		},

		'cwd.set': function (state: RootState, directory: string) {
			state.current_directory = directory;
		},

		'breakpoint.add': function (state: RootState, [line, prog]: [number, string]) {
			state.breakpoints.push({
				prog,
				line
			});
		},
		'breakpoint.del': function (state: RootState, [line, prog]: [number, string]) {
			// state.breakpoints = state.breakpoints.filter(b => b.line === line && b.prog === prog)
			let i = 0;
			while (i < state.breakpoints.length) {
				if (state.breakpoints[i].line === line && state.breakpoints[i].prog === prog) {
					state.breakpoints.splice(i, 1);
				} else i++
			}
		},
		'breakpoint.delAll': function (state: RootState, prog: string) {
			// state.breakpoints = state.breakpoints.filter(b => b.prog === prog)
			let i = 0;
			while (i < state.breakpoints.length) {
				if (state.breakpoints[i].prog === prog) {
					state.breakpoints.splice(i, 1);
				} else i++
			}
		},
		'hwhile.showAllOutput': function (state: RootState, showAll: boolean) {
			state.settings.general.showAllHWhileOutput = showAll;
		},
	},
	plugins: [
		//Enable persistence
		vuexLocal.plugin,
		//Enable sharing between concurrent tabs/windows
		createMutationsSharer({
			predicate: [
				'addRunConfig',
				'removeRunConfig',
				'overwriteRunConfig',
				'setChosenRunConfig',
				'setAppTheme',
				'setHWhilePath',
				'cwd.set',
				'hwhile.showAllOutput',
			],
		})
	],
});

export default store;