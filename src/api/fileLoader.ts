import path from "path";
import xdgBasedir from "xdg-basedir";
import fs, { Stats } from "fs";
import parse_menu_file, { Menu } from "@/api/parsers/MenuParser";
import { MenuManager } from "@/api/managers/MenuManager";

/**
 * A wrapper interface to simplify mapping strings to objects
 */
interface CustomDict<T> {
	[key: string]: T;
}

/**
 * Hold all the manager objects in one place.
 * Saves having loads of arguments in each function.
 */
interface Managers {
	menuManager: MenuManager;
}


//1st party config root
const SYSTEM_CONFIG_ROOT = path.resolve(".", "config");
console.log(`System Config: ${SYSTEM_CONFIG_ROOT}`);
//3rd party config root
const USER_CONFIG_ROOT = xdgBasedir.config || "./whide";

//Map file extensions to file loaders
//This requires much less code duplication
type ConfigFileLoader = (path: string, managers: Managers) => void | Promise<void>;
const CONFIG_EXTENSIONS : CustomDict<ConfigFileLoader> = {
	".whide-menu": async (filePath : string, managers : Managers) => {
		let content = await readFile(filePath);
		let menus : Menu[] = parse_menu_file(content);
		for (let menu of menus) managers.menuManager.register(menu);
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
 * @param fs_root	The file root
 * @param managers	The manager objects
 */
async function load_all_packages(fs_root: string, managers : Managers) : Promise<void> {
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
				let fileInfo : Stats = fs.lstatSync(fullPath);
				//Treat directories as if they are plugin packages
				if (fileInfo.isDirectory()) {
					await load_package(fullPath, managers);
				//Treat files as config files
				} else {
					await load_config_file(fullPath, managers);
				}
			}

			//Success
			resolve();
		});
	});
}

/**
 * Load the code and config files for a specific package
 * @param filePath	The file path
 * @param managers	The manager objects
 */
async function load_package(filePath: string, managers: Managers) : Promise<void> {
	return new Promise((resolve, reject) => {
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

				//TODO: Load the actual code files as well

				//Load config files
				if (fileInfo.isFile()) {
					//This ignores files which don't have the config extensions
					await load_config_file(fullPath, managers);
				}
			}
			//Success
			resolve();
		});
	});
}

/**
 * Load the contents of the file into the relevant object(s)
 * @param filePath	The file path
 * @param managers	The manager objects
 */
async function load_config_file(filePath: string, managers : Managers) : Promise<boolean> {
	//Get the file extension
	let ext = path.extname(filePath).toLowerCase();

	//Run the loader for the file type
	let loader : ConfigFileLoader|undefined = CONFIG_EXTENSIONS[ext] || undefined;
	if (loader){
		try {
			await loader(filePath, managers);
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
export async function run_load(watch: boolean = true, externalModules : boolean = true) : Promise<Managers> {
	//TODO: Unregister all plugins first
	//TODO: Watch for file changes

	//Hold all the plugin managers
	const managers : Managers = {
		menuManager: new MenuManager(),
	};

	//Load the 1st party plugins
	await load_all_packages(SYSTEM_CONFIG_ROOT, managers);
	//Load the 3rd party plugins, if enabled
	if (externalModules) await load_all_packages(USER_CONFIG_ROOT, managers);

	//Return the managers
	return managers;
}
