import { PluginInfo } from "@/api/types/PluginInfo";
import { PluginManager } from "@/api/managers/PluginManager";
import { PluginModule } from "@/api/types/PluginModule";
import path from "path";

export default class SystemPluginLoader {
	private readonly _pluginManager: PluginManager;

	constructor() {
		this._pluginManager = new PluginManager();
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

			//Make an object representing the plugin
			let info: PluginInfo = new PluginInfo({
				name: path.basename(modulePath),
				menuManager: this.pluginManager.menuManager,
				external: false,
				path: modulePath,
				module: module,
			});

			//Register the plugin
			this.pluginManager.register(info);
		}
	}

	get pluginManager(): PluginManager {
		return this._pluginManager;
	}
}
