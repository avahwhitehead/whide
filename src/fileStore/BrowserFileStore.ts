import IdbKvStore from "idb-kv-store";
import Crypto from 'crypto-js';
import { FileData } from "@/fileStore/FileData";
import { FileStoreInterface } from "@/fileStore/FileStoreInterface";
import { StoredFile } from "@/fileStore/StoredFile";

/**
 * A file store using the browser's Indexed DB as backend.
 */
export class BrowserFileStore implements FileStoreInterface {
	private _DB_NAME = "FileStore";
	private keyStore : IdbKvStore | undefined;
	private fileTree : FileData[] = [];

	/**
	 * Generate a unique ID for files
	 * @param name		The file name
	 * @param created	The time the file was created
	 * @returns	Unique hex ID string for the file based on the name and timestamp
	 */
	private static _getId(name: string, created: Date = new Date()) {
		let res = Crypto.SHA1(`${created.getTime()}-${name}`);
		return Crypto.enc.Hex.stringify(res);
	}

	constructor() {
		this._loadDirectoryTree().then(value => {
			this.fileTree = value;
		})
	}


	public async createFile(name : string, parent? : FileData): Promise<FileData> {
		//File metadata
		let metadata = new Map();
		metadata.set('created', new Date());
		//Get an ID for the file
		let id = BrowserFileStore._getId(name, metadata.get('created'));
		//Create the file object
		let fileData = new FileData(id, name, parent);
		fileData.metadata = metadata;

		if (parent) {
			//Add the file to its parent
			parent.addChild(fileData);
		} else {
			(await this.getDirectoryTree()).push(fileData);
		}
		//Save the new directory structure
		await this._saveDirectoryTree();
		//Save the file contents
		await this.writeFile(fileData);

		//Return the file
		return fileData;
	}

	public async createFolder() : Promise<FileData> {
		//TODO: Create Folder
		return new Promise(() => {});
	}

	public async deleteFile(file : FileData): Promise<void> {
		let promises: Promise<any>[] = [];

		//Remove the file from its parent, if possible
		if (file.parent) {
			file.parent.removeChild(file);
		} else {
			let index = this.fileTree.indexOf(file);
			this.fileTree.splice(index, 1);
		}
		//Save the new tree
		promises.push(this._saveDirectoryTree());

		//Remove the file content/metadata
		let store : IdbKvStore = this._getStore();
		promises.push(store.remove(`content:${file.id}`));
		promises.push(store.remove(`meta:${file.id}`));

		//Don't return until all the promises are complete
		await Promise.all(promises);
	}

	public async getDirectoryTree(): Promise<FileData[]> {
		return await this._loadDirectoryTree();
	}

	public async writeFile(file : FileData): Promise<void> {
		//Atomise the save - all or nothing
		let transaction = this._getStore().transaction('readwrite');

		//Store the file content
		transaction.set(`content:${file.id}`, file.content);

		//Store the metadata
		transaction.set(`meta:${file.id}`, file.metadata);

		//Wait to complete
		await transaction.done;
	}


	public async readFile(file : FileData) : Promise<FileData> {
		//Get the store object
		let store : IdbKvStore = this._getStore();

		//Read the file content
		file.content = await store.get(`content:${file.id}`) || "";
		//Read the metadata
		file.metadata = await store.get(`meta:${file.id}`) || {};

		//Return the file
		return file;
	}


	/**
	 * Load the directory tree from persistent storage, updating the local copy
	 */
	public async _loadDirectoryTree(): Promise<FileData[]> {
		//Read the stored tree
		let tree = await this._getStore().get("dirtree") || [];

		//Decode the stored tree
		let t = [];
		for (let v of tree) {
			t.push(await this._convert_from_stored(v));
		}

		//Return the tree
		return this.fileTree = t;
	}

	/**
	 * Store the directory tree into persistent storage.
	 */
	public async _saveDirectoryTree(): Promise<void> {
		//Get the store
		let store : IdbKvStore = this._getStore();
		//Convert the tree into a storable format
		let storableTree = this.fileTree.map(v => this._toStored(v));
		store.set('dirtree', storableTree)
	}

	/**
	 * Convert a FileData object to StoredFile
	 * @param file	The file to convert
	 */
	private _toStored(file : FileData) : StoredFile {
		return {
			id: file.id,
			name: file.name,
			children: (file.children.length) ? file.children.map(child => this._toStored(child)) : undefined,
		};
	}

	/**
	 * Get the database store object
	 */
	private _getStore() : IdbKvStore {
		//Make a new store if one is not defined
		if (!this.keyStore) this.keyStore = new IdbKvStore(this._DB_NAME);
		//Return the object
		return this.keyStore;
	}

	/**
	 * Recursively convert StoredFiles to FileData objects
	 * @param file		The stored file
	 * @param parent	The parent file, should be undefined on the first level
	 */
	private async _convert_from_stored(file : StoredFile, parent? : FileData) : Promise<FileData> {
		//Create a FileData object from the id/name/parent
		let fileData : FileData = new FileData(file.id || "", file.name || "unnamed", parent);

		//Recursively load child files, if possible
		for (const v of file.children || []) {
			let child = this._convert_from_stored(v, fileData);
			fileData.addChild(await child);
		}

		//Return the create object
		return fileData;
	}
}
