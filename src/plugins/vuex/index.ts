import Vue from 'vue'
import Vuex, { Store } from 'vuex';
import { RunConfiguration } from "@/types/RunConfiguration";
import VuexPersistence from "vuex-persist";
import createMutationsSharer from "vuex-shared-mutations";
import { FileInfoState } from "@/types/FileInfoState";
import { AbstractRunner } from "@/run/AbstractRunner";
import fileTemplates, { FileTemplateList } from "@/templates/while";

const electron = (window['require'] !== undefined) ? require("electron") : undefined;

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
	runConfigurations: string[];
	chosenRunConfig: string|undefined;
	runConfigLookup: {[key: string]: RunConfiguration},
	settings: SettingsState;
	openFiles: string[];
	fileLookup: {[key: string]: FileInfoState},
	breakpoints: {line: number, prog: string}[];
	focusedFile: string|undefined;
	current_directory: string|undefined;
	isElectron: boolean;
	isMac: boolean;
	programRunners: {name:string, runner:AbstractRunner}[],
	fileTemplates: FileTemplateList;
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
			runConfigurations: [...state.runConfigurations],
			runConfigLookup: {...state.runConfigLookup},
			current_directory: state.current_directory,
			focusedFile: state.focusedFile,
		};
	},
})

/**
 * Perform some validation to make sure the persisted state is loaded in the correct way for this version of the app.
 * @param store
 */
function _validateState(store: Store<RootState>): void {
	const state: RootState = store.state;
	let runConfigs = [];
	let runConfigLookup: {[key: string]: RunConfiguration} = {};

	//Ensure the stored run configurations are held as a string array with object lookup
	//Instead of an array of objects
	for (let config of state.runConfigurations as (string|RunConfiguration)[]) {
		if (config === undefined) continue;

		if (typeof config === 'string') {
			if (state.runConfigLookup[config] !== undefined) {
				runConfigs.push(config);
				runConfigLookup[config] = state.runConfigLookup[config];
			}
		} else {
			if (state.runConfigLookup[config.name] !== undefined) {
				runConfigLookup[config.name] = config;
				runConfigs.push(config.name);
			}
		}
	}
	store.commit('replaceRunConfigs', [runConfigs, runConfigLookup]);

	if (runConfigLookup[state.chosenRunConfig as any] === undefined) {
		store.commit('setChosenRunConfig', runConfigs[0]);
	}
}

function onStoreLoaded(store: Store<RootState>): void {
	_validateState(store);
}

//The VueX store object
const store = new Vuex.Store<RootState>({
	state: {
		runConfigurations: [],
		runConfigLookup: {},
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
		focusedFile: undefined,
		fileLookup: {},
		current_directory: undefined,
		isElectron: (window['require'] !== undefined),
		isMac: (electron?.remote.process.platform === 'darwin'),
		breakpoints: [],
		programRunners: [],
		fileTemplates: fileTemplates,
	},
	mutations: {
		/**
		 * Add a new run configuration to the list
		 * @param state		VueX state object
		 * @param config	Run configuration object to add
		 */
		addRunConfig(state: RootState, config: RunConfiguration): void {
			state.runConfigLookup[config.name] = config;
			state.runConfigurations.push(config.name)
		},

		/**
		 * Remove a run configuration from the list
		 * @param state		VueX state object
		 * @param config	Run configuration object to remove
		 */
		removeRunConfig(state: RootState, config: string): void {
			delete state.runConfigLookup[config];

			let index: number = state.runConfigurations.indexOf(config);
			if (index > -1) {
				state.runConfigurations.splice(index, 1);
				if (state.chosenRunConfig === config) {
					Math.min(index, state.runConfigurations.length - 1)
					state.chosenRunConfig = state.runConfigurations[index];
				}
			}
		},

		overwriteRunConfig(state: RootState, [oldConfig, config]: [string, RunConfiguration]): void {
			let index: number = state.runConfigurations.indexOf(oldConfig);
			if (index > -1) {
				state.runConfigurations.splice(index, 1, config.name);

				delete state.runConfigLookup[oldConfig];
				state.runConfigLookup[config.name] = config;

				if (state.chosenRunConfig === oldConfig) {
					state.chosenRunConfig = config.name;
				}
			}
		},

		setChosenRunConfig(state: RootState, config: string) {
			state.chosenRunConfig = config;
		},

		replaceRunConfigs(state: RootState, [runConfigs, runConfigLookup]: [string[], {[key: string]: RunConfiguration}]): void {
			state.runConfigurations = runConfigs;
			state.runConfigLookup = runConfigLookup;
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

		'openFiles.set': function (state: RootState, files: string[]) {
			state.openFiles = files;
		},
		'openFiles.setFocused': function (state: RootState, file: string|undefined) {
			state.focusedFile = file;
		},
		'openFiles.focused.setExtended': function (state: RootState, isExt: boolean) {
			if (state.focusedFile !== undefined) state.fileLookup[state.focusedFile].extWhile = isExt;
		},
		'openFile.open': function (state: RootState, file: FileInfoState) {
			if (!state.openFiles.includes(file.id)) {
				state.openFiles.push(file.id);
				state.fileLookup[file.id] = file;
			}
		},
		'openFile.close': function (state: RootState, file: string) {
			state.openFiles = state.openFiles.filter(e => e !== file);
			delete state.fileLookup[file];
			if (state.focusedFile === file) state.focusedFile = state.openFiles[0];
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
				'openFiles.setFocused',
			],
		})
	],
});

onStoreLoaded(store);

export default store;