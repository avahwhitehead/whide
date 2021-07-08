//Vue
import Vue from 'vue';
import router from "@/router";
import vuetify from '@/plugins/vuetify'
import App from "@/views/App.vue";
//FontAwesome
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { fas } from '@fortawesome/free-solid-svg-icons'
//Other
import { fs } from "@/files/fs";
import path from "path";
import { Stats } from "fs";
import { vars } from "@/utils/globals";
import { ProgramOptions } from "@/types/CommandLine";

//Make all icons available to FontAwesome
library.add(fas);
//Allow using FontAwesome component without import
Vue.component('FontAwesomeIcon', FontAwesomeIcon);

Vue.config.productionTip = false;

/**
 * Get the command line arguments object from Electron if possible.
 * Otherwise return an empty object (i.e. use all default values).
 */
async function _getCommandLineArgs(): Promise<ProgramOptions> {
	let electron: any;
	//Credit for this from https://stackoverflow.com/a/39942902/2966288
	//Attempt to import the electron renderer module
	if (window['require'] !== undefined) {
		electron = window['require']("electron");
	} else {
		//Not running electron - return the default values
		return {};
	}
	//Request the command line arguments object from the Electron main process
	return await electron.ipcRenderer.invoke('get-cmd-args');
}

/**
 * Choose the application's starting directory from the user's requested working dir, the app's working dir, and a virtual fallback root.
 * @param userDir	The user's requested starting directory
 * @returns	string	The best path to use as CWD when starting the app
 */
async function _getStartingDir(userDir: string) : Promise<string> {
	//Application's working directory
	let currDir = process.cwd() || '/';

	//Convert the directory to absolute path
	userDir = path.resolve(userDir);

	let stats: Stats;
	try {
		//Check if the user's requested path exists
		stats = fs.statSync(userDir);
	} catch (e) {
		//See if the error is "file not found"
		if (e == 'ENOENT' || e.code === 'ENOENT') {
			//The user's requested directory wasn't found - use the current process root
			console.error("Target directory doesn't exist; using default");
			return currDir;
		} else {
			throw e;
		}
	}
	//If the path is a file, use the parent directory
	if (!stats.isDirectory()) {
		console.error("Target directory is a file; using parent");
		return path.resolve(userDir, '..');
	}
	//Otherwise Use the provided directory
	return userDir;
}

async function main() {
	//Get the user-provided command line arguments
	let commandLineArgs: ProgramOptions = await _getCommandLineArgs();

	//Configure the global `vars` object

	//Start the app in a valid directory
	vars.cwd = await _getStartingDir(commandLineArgs.workingDir || process.cwd());

	//Mount the app
	new Vue({
		router,
		vuetify,
		el: '#app',
		render: h => h(App),
		components: { App },
	});
}

main();