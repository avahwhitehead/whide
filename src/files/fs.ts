import nodeFs from "fs";
import { createFsFromVolume, IFs, Volume } from 'memfs';
import { IPromisesAPI } from "memfs/lib/promises";
import { Union } from "unionfs/lib/union";
import { IFS } from "unionfs/lib/fs";
import localforage from "localforage";

//Storage library used for persisting the memfs data
localforage.config({
	driver: localforage.INDEXEDDB,
	name: 'whide-fs',
	version: 1.0,
	storeName: 'filestore',
	description: 'Virtual file store for the Whide editor'
});

/**
 * Read the exported memfs data from persistent storage
 */
async function _readFsJson() : Promise<any> {
	//Read the object as a string
	const stored = await localforage.getItem('files');
	return stored;
}

/**
 * Write exported memfs data to persistent storage
 * @param json	The memfs exported JSON object
 */
async function _writeFsJson(json: any) : Promise<void> {
	//Convert the json to a string, and write it to the storage
	await localforage.setItem('files', json);
}

/**
 * Determine whether a fs method will affect the filesystem in a way which should be stored
 * @param funcName	The name of the method being called
 */
function _shouldRunSave(funcName: string) {
	for (let start of ['append', 'copy', 'fsync', 'ftruncate', 'mk', 'rename', 'rm', 'truncate', 'write']) {
		if (funcName.substr(0, start.length) === start) return true;
	}
	return false;
}

/**
 * The same as {@link _wrapFs} but for the memfs.promises object.
 * @param promises	The promises object to wrap
 * @param saveCb	Callback to run when the method changes data
 */
function _wrapPromises(promises: IPromisesAPI, saveCb: (prop: string) => void) : IPromisesAPI {
	return new Proxy(promises, {
		get(target: IPromisesAPI, p: string | symbol, receiver: any): any {
			//Get the actual property value
			const actualVal = Reflect.get(target, p, receiver);
			//Run the save function if the property is a function that modifies the file system
			if (typeof p === "string" && _shouldRunSave(p)) saveCb(p);
			//Return the property
			return actualVal;
		}
	});
}

/**
 * Watch a filesystem object, and call a callback if a method is called which modifies filesystem data.
 * This allows using memfs in the browser without requiring manual data export
 * @param fs		Filesystem object to wrap
 * @param saveCb	Callback to run when the method changes data
 */
function _wrapFs(fs: IFs, saveCb: (prop: string) => void) : IFs {
	//Make a wrapper around the `promises` property
	const promiseWrapper = _wrapPromises(fs.promises, saveCb);
	//Return the outer wrapper
	return new Proxy(fs, {
		get(target: IFs, p: string | symbol, receiver: any): any {
			//Get the actual property value
			const actualVal = Reflect.get(target, p, receiver);
			if (typeof p !== "string") return actualVal;
			//Return the promises wrapper if it requested
			if (p === 'promises') return promiseWrapper;
			//Run the save function if the property is a function that modifies the file system
			if (_shouldRunSave(p)) saveCb(p);
			//Return the property
			return actualVal;
		}
	});
}

//Manage the filesystems
export const ufs : Union = new Union();

//Use the physical filesystem only if available
//Otherwise maintain a virtual filesystem in memory
if (nodeFs && Object.keys(nodeFs).length) {
	ufs.use(nodeFs);
} else {
	//Make the virtual filesystem
	const vol = new Volume;
	const memfs : IFs = createFsFromVolume(vol);

	//Load from the stored filesystem JSON object
	_readFsJson().then(json => vol.fromJSON(json || {}));

	//Make a proxy around memfs to watch for FS changes, and automatically export/store the changed version
	let saveInProgress = false;
	let fsWrapper = _wrapFs(memfs, () => {
		//Don't start another save if one is in progress
		if (saveInProgress) return;
		//Mark a save as in progress
		saveInProgress = true;
		//Wait 1 second before writing the changes (give time for the changes to occur)
		setTimeout(async () => {
			//Save to JSON
			let json = vol.toJSON();
			await _writeFsJson(json);
			//Allow another save
			saveInProgress = false;
		}, 1000);
	});

	//Use the proxy object as the filesystem module
	ufs.use(fsWrapper as any);
}

//Export the chosen filesystem module for use by the rest of the app
//@ts-ignore
export const fs : IFS = ufs;
