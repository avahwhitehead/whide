import { PluginInfo } from "@/api/types/PluginInfo";
import { PluginManager } from "@/api/managers/PluginManager";
import { PluginModule } from "@/api/types/PluginModule";
import path from "path";
import { PluginFunction } from "@/api/types/PluginFunction";

export default class SystemPluginLoader {
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
		//Read the plugins in the directory
		const requireContext: __WebpackModuleApi.RequireContext = require.context(
			//Location to search for the plugins
			//Must be a static string here, otherwise webpack will exclude the plugins
			"../../config/",
			//Look for subdirectories as well
			true,
			//Filter to only subdirectories ending in '/' (removes duplicates)
			/\/$/
		);

		for (let modulePath of requireContext.keys()) {
			//Get the actual plugin
			let module: PluginModule;
			try {
				module = requireContext(modulePath);
			} catch (e) {
				throw new Error(`Couldn't load system plugin "${modulePath}"`);
			}

			//Register the plugin
			let info: PluginInfo = this.pluginManager.register({
				//TODO: Get the actual module name
				name: path.basename(modulePath),
				path: modulePath,
				menus: module.menus,
				external: false,
				disabled: false,
			});

			//Load the functions
			const loadedFunc: PluginFunction|PluginFunction[] = module.default;
			info.registerFuncs(loadedFunc);
		}
	}

	get pluginManager(): PluginManager {
		return this._pluginManager;
	}
}
