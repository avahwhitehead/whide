import IdbKvStore from "idb-kv-store";
import Crypto from 'crypto-js';
import { AbstractFileData, FileData, FolderData } from "@/fileStore/AbstractFileData";
import { FileStoreInterface } from "@/fileStore/FileStoreInterface";
import { StoredFile } from "@/fileStore/StoredFile";
import path from "path";

/**
 * A file store using the browser's Indexed DB as backend.
 */
export class BrowserFileStore implements FileStoreInterface {
	private _DB_NAME = "FileStore";
	private keyStore : IdbKvStore | undefined;
	private fileTree : AbstractFileData[] = [];

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

	public async resolvePath(file_path: string) : Promise<AbstractFileData|undefined> {
		//Make sure the path is absolute
		if (!path.isAbsolute(file_path)) throw new Error("Only absolute paths can be resolved");

		//Resolve any `./` and `../` etc in the path
		const normalised: string = path.normalize(file_path);
		//Navigate through the file tree, following the path
		return this._follow_path(this.fileTree, normalised.split(file_path));
	}

	public async createFile(name : string, parent? : FolderData): Promise<FileData> {
		//File metadata
		let metadata = new Map();
		metadata.set('created', new Date());
		//Get an ID for the file
		let id = BrowserFileStore._getId(name, metadata.get('created'));
		//Create the file object
		let fileData: FileData = new FileData(id, name, parent);
		fileData.metadata = metadata;

		if (parent) {
			//Add the file to its parent
			parent.addChild(fileData);
		} else {
			this.fileTree.push(fileData);
		}
		//Save the new directory structure
		await this._saveDirectoryTree();
		//Save the file contents
		await this.writeFile(fileData);

		//Return the file
		return fileData;
	}

	public async createFolder(name : string, parent? : FolderData): Promise<FolderData> {
		//File metadata
		let metadata = new Map();
		metadata.set('created', new Date());
		//Get an ID for the file
		let id = BrowserFileStore._getId(name, metadata.get('created'));
		//Create the file object
		let folderData: FolderData = new FolderData(id, name, parent, []);
		folderData.metadata = metadata;

		if (parent) {
			//Add the file to its parent
			parent.addChild(folderData);
		} else {
			this.fileTree.push(folderData);
		}
		//Save the new directory structure
		await this._saveDirectoryTree();
		//Save the file contents
		await this._writeFolder(folderData);

		//Return the file
		return folderData;
	}

	public async deleteFile(file : AbstractFileData): Promise<void> {
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

	public async getDirectoryTree(): Promise<AbstractFileData[]> {
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

	private async _writeFolder(folder : FolderData): Promise<void> {
		//Store the metadata
		await this._getStore().set(`meta:${folder.id}`, folder.metadata);
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
	public async _loadDirectoryTree(): Promise<AbstractFileData[]> {
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
	 * Recursively find a file using its name
	 * @return {null|FileData}	The found file or null
	 */
	private _follow_path(files: AbstractFileData[], path_elements: string[]) : AbstractFileData | undefined {
		if (path_elements.length === 0) return undefined;

		//Remove the first element from the path, and store it
		let root_name: string = path_elements.slice(1, path_elements.length)[0];

		//See if any files at this level match the name
		let file: AbstractFileData|undefined = files.find(f => f.name === root_name);
		if (!file) return undefined;

		//If it is a folder
		if (file.type === "folder") {
			//The search path stops here, return this folder
			if (path_elements.length === 0) return file;
			//Search this folder's children
			return this._follow_path((<FolderData>file).children, path_elements);
		}

		//The path stops here, return this file
		if (path_elements.length === 0) return file;
		//The requested file is supposed to be a child
		return undefined;
	}

	/**
	 * Convert a FileData object to StoredFile
	 * @param file	The file to convert
	 */
	private _toStored(file : AbstractFileData) : StoredFile {
		if (file instanceof FolderData) {
			return {
				id: file.id,
				name: file.name,
				children:file.children.map(child => this._toStored(child)),
			};
		}
		return {
			id: file.id,
			name: file.name,
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
	private async _convert_from_stored(file : StoredFile, parent? : FolderData) : Promise<AbstractFileData> {
		let id = file.id || "";
		let name = file.name || "unnamed";

		//Create a FileData object from the id/name/parent
		if (file.children) {
			let folderData: FolderData = new FolderData(id, name, parent);
			//Recursively load child files, if possible
			for (const v of file.children || []) {
				let child = this._convert_from_stored(v, folderData);
				folderData.addChild(await child);
			}
			return folderData;
		}
		return new FileData(id, name, parent);
	}
}
