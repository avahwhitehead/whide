//Vue
import Vue from 'vue';
import router from "@/router";
import App from "@/views/App.vue";
//Other
import { fs } from "@/files/fs";
import path from "path";
import { Stats } from "fs";
import { isElectron, vars } from "@/utils/globals";

Vue.config.productionTip = false;

async function _getStartingDir() : Promise<string> {
	//Fallback directory if the path is completely invalid
	const FALLBACK_DIR : string = isElectron ? process.cwd() : '/';

	//No directory specified - use the default
	if (!vars.cwd) return FALLBACK_DIR;

	//Convert the directory to absolute path
	const userDir = path.resolve(vars.cwd);

	let stats: Stats;
	try {
		//Make sure the path exists
		stats = await new Promise<Stats>((resolve, reject) => {
			fs.stat(userDir, ((err:any, s:Stats) => {
				if (err) reject(err);
				else resolve(s);
			}));
		});
	} catch (e) {
		//See if the error is "file not found"
		if (e == 'ENOENT' || e.code === 'ENOENT') {
			console.error("Target directory doesn't exist; using default");
			return FALLBACK_DIR;
		} else {
			throw e;
		}
	}

	//If the path is a file, use the parent
	if (!stats.isDirectory()) {
		console.error("Target directory is a file; using parent");
		return path.resolve(userDir, '..');
	}
	//Otherwise Use the provided directory
	return userDir;
}

/**
 * Update the global `var` object with values from the command line arguments provided to electron.
 * If the app is not running in electron, leave them as they are.
 */
async function _setupVarsFromCommandLineArgs() {
	if (isElectron) {
		//Import electron
		const electron = await import("electron");
		//Get the command line argument values
		vars.cwd = electron.remote.getGlobal("cwd") as string;
	}
}

async function main() {
	await _setupVarsFromCommandLineArgs();
	//Make sure the app starts in a valid directory
	vars.cwd = await _getStartingDir();

	//Mount the app
	new Vue({
		router,
		el: '#app',
		render: h => h(App),
		components: { App },
	});
}

main();