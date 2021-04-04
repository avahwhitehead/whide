import { PluginInfo } from "@/api/PluginInfo";
import { PluginManager } from "@/api/managers/PluginManager";
import path from "path";
import { PluginModule, PluginFunction } from "@whide/whide-types";

function _getPackageJson(modulePath: string) : any {
	try {
		//Load the module's package.json file
		return require("../../config/" + path.join(modulePath, "package.json"));
	} catch {
		//Couldn't read the package.json file
		return undefined;
	}
}

/**
 * Load all the plugin files
 */
export async function run_load(pluginManager : PluginManager) : Promise<void> {
	//Read the plugins in the directory
	const requireContext: __WebpackModuleApi.RequireContext = require.context(
		//Location to search for the plugins
		//Must be a static string here, otherwise webpack will exclude the plugins
		"../../config/",
		//Look for subdirectories as well
		true,
		//Filter to only immediate subdirectories ending in '/' (removes duplicates, and prevents loading plugins' dependencies as plugins)
		/^\.\/[^/]+\/$/
	);

	for (let modulePath of requireContext.keys()) {
		//Get the actual plugin
		let pluginModule: PluginModule;
		try {
			pluginModule = requireContext(modulePath);
		} catch (e) {
			console.error(e);
			throw new Error(`Couldn't load system plugin "${modulePath}"`);
		}

		//Get the plugin's package.json file
		let packageJson = _getPackageJson(modulePath);

		//Plugin name
		let moduleName = (packageJson ? packageJson.name : '') || path.basename(modulePath);
		//Plugin description
		let description = (packageJson && packageJson.description) || "";

		//Load the functions
		const funcs: undefined|PluginFunction|PluginFunction[] = pluginModule.default;
		//Warn if the plugin doesn't do anything
		if (!pluginModule.converters) {
			if (!funcs) console.warn(`No exported functions from system plugin "${moduleName}" at "${modulePath}"`);
			if (!pluginModule.menus) console.warn(`No exported menus from system plugin "${moduleName}" at "${modulePath}"`);
		}

		//Register the plugin
		let info: PluginInfo = pluginManager.register({
			name: moduleName,
			path: modulePath,
			description: description,
			menus: pluginModule.menus,
			settings: pluginModule.settings,
			converters: pluginModule.converters,
			external: false,
			disabled: false,
		});
		info.registerFuncs(funcs || []);
	}
}
export default run_load;