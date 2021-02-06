import { PluginInfo } from "@/api/types/PluginInfo";
import { PluginManager } from "@/api/managers/PluginManager";
import { PluginModule } from "@/api/types/PluginModule";
import path from "path";
import { PluginFunction } from "@/api/types/PluginFunction";

/**
 * Get a module's name from its path
 * @param modulePath	Path to the module root (relative to ../../config/)
 */
function _getModuleName(modulePath: string) {
	let moduleName: string;
	try {
		//Load the module's package.json file
		let packageJson: any = require("../../config/" + path.join(modulePath, "package.json"));
		//Read the module name from the package
		moduleName = packageJson.name;
	} catch {
		//Couldn't read the package.json file
		moduleName = "";
	}
	//Use the folder name if the name couldn't be determined
	return moduleName || path.basename(modulePath);
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
		//Filter to only subdirectories ending in '/' (removes duplicates)
		/\/$/
	);

	for (let modulePath of requireContext.keys()) {
		//Get the actual plugin
		let pluginModule: PluginModule;
		try {
			pluginModule = requireContext(modulePath);
		} catch (e) {
			throw new Error(`Couldn't load system plugin "${modulePath}"`);
		}

		//Get the module name
		let moduleName = _getModuleName(modulePath);

		//Register the plugin
		let info: PluginInfo = pluginManager.register({
			name: moduleName,
			path: modulePath,
			menus: pluginModule.menus,
			external: false,
			disabled: false,
		});

		//Load the functions
		const loadedFunc: PluginFunction|PluginFunction[] = pluginModule.default;
		info.registerFuncs(loadedFunc);
	}
}
export default run_load;