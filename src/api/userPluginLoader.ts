import path from "path";
import xdgBasedir from "xdg-basedir";
import { PluginInfo } from "@/api/types/PluginInfo";
import { PluginManager } from "@/api/managers/PluginManager";
import { PluginModule } from "@/api/types/PluginModule";
import electron from "electron";
import * as fs from "fs";
import { Stats } from "fs";
import { PluginFunction } from "@/api/types/PluginFunction";

//3rd party plugins root
const USER_CONFIG_ROOT = path.resolve((xdgBasedir.config || '.'), "whide", "plugins");

export default class UserPluginLoader {
	private readonly _pluginManager: PluginManager;

	/**
	 *
	 * @param pluginManager	The plugin manager to use.
	 * 						If not provided, a new one will be created.
	 */
	constructor(pluginManager? : PluginManager) {
		this._pluginManager = pluginManager || new PluginManager();
	}

	/**
	 * Load all the plugin files
	 */
	public async run_load() : Promise<void> {
		// return;
		// noinspection UnreachableCodeJS
		const files = fs.readdirSync(USER_CONFIG_ROOT);

		for (let fileName of files) {
			let filePath : string = path.resolve(USER_CONFIG_ROOT, fileName);
			const stats : Stats = fs.statSync(filePath);
			if (stats.isDirectory()) {
				//Get the actual plugin
				let pluginModule: PluginModule;
				try {
					pluginModule = electron.remote.require(filePath);
				} catch (e) {
					console.error(e);
					throw new Error(`Couldn't load system plugin "${fileName}"`);
				}

				//Register the plugin
				let info: PluginInfo = this.pluginManager.register({
					//TODO: Get the actual module name
					name: fileName,
					path: filePath,
					menus: pluginModule.menus || [],
					external: true,
					disabled: false,
				});

				//Load the functions
				const funcs: PluginFunction|PluginFunction[] = pluginModule.default;
				info.registerFuncs(funcs);
			}
		}
	}

	get pluginManager(): PluginManager {
		return this._pluginManager;
	}
}
