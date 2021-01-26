import path from "path";
import xdgBasedir from "xdg-basedir";
import fs, { Stats } from "fs";
import parse_menu_file, { Menu } from "@/api/parsers/MenuParser";
import { PluginInfo } from "@/api/types/PluginInfo";
import { CustomDict } from "@/types/CustomDict";
import { PluginManager } from "@/api/managers/PluginManager";

//1st party config root
const SYSTEM_CONFIG_ROOT = path.resolve(".", "config");
//3rd party config root
const USER_CONFIG_ROOT = xdgBasedir.config || "./whide";

//Map file extensions to file loaders
//This requires much less code duplication
type ConfigFileLoader = (path: string, info: PluginInfo) => void | Promise<void>;
const CONFIG_EXTENSIONS : CustomDict<ConfigFileLoader> = {
	".whide-menu": async (filePath : string, info : PluginInfo) => {
		let content = await readFile(filePath);
		let menus : Menu[] = parse_menu_file(content, info);
		info.menus.push(...menus);
	},
};

/**
 * Read a file to a string
 * @param filePath	The file path
 */
async function readFile(filePath: string) : Promise<string> {
	return new Promise<string>((resolve, reject) => {
		fs.readFile(filePath, { encoding: "utf8" }, (err : NodeJS.ErrnoException | null, data : string) => {
			if (err) reject(err);
			else resolve(data);
		})
	});
}

/**
 * Load all the packages from a given directory.
 * @param fs_root			The file root
 * @param pluginManager		The pluginManager object
 * @param isExternal		Whether the plugin is an external plugin
 */
async function load_all_packages(fs_root: string, pluginManager : PluginManager, isExternal : boolean) : Promise<void> {
	return new Promise((resolve, reject) => {
		//Read all the files in the directory
		fs.readdir(fs_root, async (err : NodeJS.ErrnoException | null, files : string[]) => {
			//Error reading files
			if (err) {
				reject(err);
				return;
			}

			//Go through each found file
			for (let file of files) {
				let fullPath = path.join(fs_root, file);
				let fileInfo: Stats = fs.lstatSync(fullPath);

				//Treat directories as if they are plugin packages
				if (fileInfo.isDirectory()) {
					let pluginInfo: PluginInfo = await load_package(fullPath, file, isExternal, pluginManager);
					pluginManager.register(pluginInfo);
				}
			}
			//Success
			resolve();
		});
	});
}

/**
 * Load the code and config files for a specific package
 * @param filePath			The file path
 * @param name				The name of the package
 * @param isExternal		Whether the plugin is an external plugin
 * @param pluginManager		THe plugin manager
 */
async function load_package(filePath: string, name: string, isExternal: boolean, pluginManager: PluginManager) : Promise<PluginInfo> {
	return new Promise((resolve, reject) => {
		//Make a PluginInfo object
		let pluginInfo: PluginInfo = new PluginInfo({
			name: name,
			path: filePath,
			external: !isExternal,
			menuManager: pluginManager.menuManager,
		});

		//Read the files in the directory
		fs.readdir(filePath, async (err : NodeJS.ErrnoException | null, files : string[]) => {
			//Error while reading the files
			if (err) {
				reject(err);
				return;
			}

			//Iterate over the files
			for (let file of files) {
				let fullPath = path.join(filePath, file);
				let fileInfo : Stats = fs.lstatSync(fullPath);

				//Load config files
				if (fileInfo.isFile()) {
					//This ignores files which don't have the config extensions
					await load_config_file(fullPath, pluginInfo);
				}
			}
			//Success
			resolve(pluginInfo);
		});
	});
}

/**
 * Load the contents of the file into the relevant object(s)
 * @param filePath		The path to the configuration file
 * @param pluginInfo	The plugin's object
 */
async function load_config_file(filePath: string, pluginInfo : PluginInfo) : Promise<boolean> {
	//Get the file extension
	let ext = path.extname(filePath).toLowerCase();

	//Run the loader for the file type
	let loader : ConfigFileLoader|undefined = CONFIG_EXTENSIONS[ext] || undefined;
	if (loader){
		try {
			await loader(filePath, pluginInfo);
		} catch (e) {
			throw new Error("Could not load file:\n" + e.message);
		}
		return true;
	} else {
		//Unknown file type
		return false;
	}
}

/**
 * Load all the plugin files
 * @param watch		Whether to set up file watchers to watch for file changes
 * @param externalModules	Whether to ignore user extensions
 */
export async function run_load(watch: boolean = true, externalModules : boolean = true) : Promise<PluginManager> {
	//Make a plugin manager to control which plugins are loaded
	const pluginManager : PluginManager = new PluginManager();

	//TODO: Watch for plugin file changes

	//Load the 1st party plugins
	await load_all_packages(SYSTEM_CONFIG_ROOT, pluginManager, false);
	//Load the 3rd party plugins, if enabled
	if (externalModules) await load_all_packages(USER_CONFIG_ROOT, pluginManager, true);

	//Return the managers
	return pluginManager;
}
