import path from "path";
import xdgBasedir from "xdg-basedir";
import { PluginInfo } from "@/api/PluginInfo";
import { PluginManager } from "@/api/managers/PluginManager";
import electron from "electron";
import fs, { Stats } from "fs";
import { PluginModule, PluginFunction } from "@whide/whide-types";

//3rd party plugins root
const USER_CONFIG_ROOT = path.resolve((xdgBasedir.config || '.'), "@whide", "whide", "plugins");

/**
 * Get a module's name from its path
 * @param modulePath	Full path to the module root
 */
function _getModuleName(modulePath: string) {
	let moduleName: string;
	try {
		//Load the module's package.json file
		let packageJson: any = electron.remote.require(path.join(modulePath, "package.json"));
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
	//Create the plugin folder if it doesn't exist
	if (!fs.existsSync(USER_CONFIG_ROOT)) {
		console.log(`Couldn't find plugin root. Creating "${USER_CONFIG_ROOT}"`);
		fs.mkdirSync(USER_CONFIG_ROOT, {recursive: true});
	}

	//Read all the folders in the plugin folder
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

			//Get the module name
			let moduleName : string = _getModuleName(filePath);

			//Load the functions
			const funcs: undefined|PluginFunction|PluginFunction[] = pluginModule.default;
			//Warn if the plugin doesn't do anything
			if (!pluginModule.converters) {
				if (!funcs) console.warn(`No exported functions from plugin "${moduleName}" at "${filePath}"`);
				if (!pluginModule.menus) console.warn(`No exported menus from plugin "${moduleName}" at "${filePath}"`);
			}

			//Register the plugin
			let info: PluginInfo = pluginManager.register({
				name: moduleName,
				path: filePath,
				menus: pluginModule.menus || [],
				converters: pluginModule.converters || [],
				external: true,
				disabled: false,
			});

			//Load the functions
			info.registerFuncs(funcs || []);
		}
	}
}
export default run_load;