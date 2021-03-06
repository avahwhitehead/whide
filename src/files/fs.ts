import isElectron from "@/types/isElectron";
import * as nodeFs from "fs";
import * as nodePath from "path";
import { FileSystemInterface, fs as filerFs, path as filerPath, FilerPathInterface } from "filer";

//Custom FS type representing only common methods in both systems
export type CustomFs = FileSystemInterface | typeof nodeFs;
export type CustomPath = FilerPathInterface | typeof nodePath;

/**
 * Promisified wrapper around `fs.exists`
 * @param fs		The filesystem object to use
 * @param filePath	The filepath to check
 */
async function _exists(fs : FileSystemInterface, filePath='/') : Promise<boolean> {
	return new Promise<boolean>((resolve, reject) => {
		fs.stat(filePath, (err: any) => {
			//No error - file exists
			if (!err) resolve(true);
			//File not found
			else if (err.code === 'ENOENT') resolve(false);
			//Some other error
			else reject(err);
		});
	});
}

/**
 * Create a virtual filesystem root if one does not exists.
 * Basically just a fancy `mkdir` call.
 * @param fs		The filesystem object to use
 * @param filePath	the filepath to create. Missing parent folders are created recursively.
 */
async function _setup_virtual_root(fs : FileSystemInterface, filePath='/whide/') : Promise<void> {
	//Do nothing if the path exists
	if (await _exists(fs, filePath)) return;
	//Otherwise recursively create the path
	return new Promise<void>((resolve, reject) => {
		fs.mkdir(filePath, { recursive: true }, (err : any) => {
			if (err) reject(err);
			else resolve();
		});
	});
}

/**
 * Import the `node/fs` module.
 */
async function _local_import(): Promise<typeof nodeFs> {
	return await import("fs");
}

/**
 * Import the virtual filesystem module, and perform any setup required.
 * This is done with singleton variables so there will be at most one database instance in the program.
 */
async function _browser_import(): Promise<FileSystemInterface> {
	//Create the file system if it doesn't already exist
	await _setup_virtual_root(filerFs);
	//Return the filesystem
	return filerFs;
}

/**
 * Get the fs module to be used to perform file operations.
 * Must be done dynamically as `node/fs` is not accessible when running in the browser.
 * IT IS RECOMMENDED TO NOT USE THIS DIRECTLY; INSTEAD USE {@link getFsContainer}
 * @param useLocal	true to force using `node/fs`.
 * 					false to force using the virtual filesystem (Filer).
* 					undefined (default) to decide automatically.
 * 					IT IS RECOMMENDED TO LEAVE THIS AS THE DEFAULT.
 * @returns `node/fs` if the app is running locally, Filer otherwise
 */
async function getFs(useLocal? : boolean) : Promise<CustomFs> {
	//Choose the module automatically if one hasn't been specified,
	//Use `node/fs` if the app is running with electron, `Filer` otherwise
	if (useLocal === undefined) useLocal = isElectron();

	//Import and return the requested module
	if (useLocal) return await _local_import();
	return await _browser_import();
}

/**
 * Get the path module to be used.
 * Must be done dynamically as the virtual fs module provides its own `path`.
 * IT IS RECOMMENDED TO NOT USE THIS DIRECTLY; INSTEAD USE {@link getFsContainer}
 * @param useLocal	true to force using `node/path`.
 * 					false to force using the virtual filesystem's path.
* 					undefined (default) to decide automatically.
 * 					IT IS RECOMMENDED TO LEAVE THIS AS THE DEFAULT.
 * @returns `node/fs` if the app is running locally, Filer's path otherwise
 */
async function getPath(useLocal? : boolean) : Promise<CustomPath> {
	//Choose the module automatically if one hasn't been specified,
	//Use `node/fs` if the app is running with electron, `Filer` otherwise
	if (useLocal === undefined) useLocal = isElectron();

	//Import and return the requested module
	return useLocal ? nodePath : filerPath;
}

/**
 * Container for the filesystem modules to be used
 */
export interface CustomFsContainer {
	fs: CustomFs;
	path: CustomPath;
}

/**
 * Get a container containing the filesystem modules which should be used.
 * This allows running in both electron and the browser.
 * @param useLocal	true to force using Node's built-in modules.
 * 					false to force using the virtual filesystem's versions.
 * 					undefined (default) to decide automatically.
 * 					IT IS RECOMMENDED TO LEAVE THIS AS THE DEFAULT.
 * @returns Container holding Node's filesystem modules if the app is running locally, Filer's versions otherwise
 */
export async function getFsContainer(useLocal? : boolean) : Promise<CustomFsContainer> {
	//Choose the module automatically if one hasn't been specified,
	//Use `node/fs` if the app is running with electron, `level-filesystem` otherwise
	if (useLocal === undefined) useLocal = isElectron();

	//Import and return the requested module
	return {
		fs: await getFs(useLocal),
		path: await getPath(useLocal),
	};
}