import path from "path";
import { CustomFs, getFs } from "@/files/fs";
import { Stats } from "fs";

/**
 * Promisified wrapper around `fs.stat`.
 * @param filePath	Path to the file
 * @param fs		The fs object to use
 */
async function _stat(filePath: string, fs: any) : Promise<any> {
	return new Promise<any>((resolve, reject) => {
		fs.stat(filePath, (err: any, stats: any) => {
			if (err) reject(err);
			else resolve(stats);
		})
	});
}

/**
 * Promisified wrapper around `fs.readdir`, returning to `AbstractInternalFile` objects instead of strings.
 * @param filePath		Path to the file
 * @param fs			The fs object to use
 * @param hiddenFiles	Whether to show hidden files
 */
async function _readdir(filePath: string, fs: CustomFs, hiddenFiles: boolean = false) : Promise<AbstractInternalFile[]> {
	return new Promise<AbstractInternalFile[]>((resolve, reject) => {
		//Read the files in the folder as a string
		fs.readdir(filePath, async (err: any, files: string[]) => {
			//Error on error
			if (err) reject(err);
			else {
				if (!hiddenFiles) {
					//Filter out hidden files
					files = files.filter(f => f.charAt(0) !== '.');
				}
				//Convert file names to the internal representation
				let internalFiles : AbstractInternalFile[] = [];
				for (let file of files) internalFiles.push(await pathToFile(file));
				//Return the file list
				resolve(internalFiles);
			}
		})
	});
}

/**
 * Promisified wrapper around `fs.readfile`.
 * @param filePath	Path to the file
 * @param fs		The fs object to use
 */
async function _readfile(filePath: string, fs: any) : Promise<string> {
	return new Promise<string>((resolve, reject) => {
		fs.readFile(filePath, (err : any, data : Buffer) => {
			if (err) reject(err);
			else resolve(data.toString());
		})
	});
}

/**
 * Promisified wrapper around `fs.writefile`.
 * @param filePath	Path to the file
 * @param fs		The fs object to use
 * @param content	The content to write
 */
async function _writefile(filePath: string, fs: any, content: string) : Promise<void> {
	return new Promise<void>((resolve, reject) => {
		fs.writeFile(filePath, content, (err : any) => {
			if (err) reject(err);
			else resolve();
		})
	});
}

// ================
// ================

/**
 * Constructor properties for internal file objects
 */
export interface InternalFileProps {
	/**
	 * File name
	 */
	name: string;
	/**
	 * Full path to the file
	 */
	fullPath: string;
	/**
	 * FS object to use when reading/writing etc
	 */
	fs: CustomFs;
}

/**
 * Parent class representing any file system object
 */
export abstract class AbstractInternalFile {
	private _name : string;
	private _fullPath : string;
	private _fs: CustomFs;

	protected constructor(props : InternalFileProps) {
		this._name = props.name;
		this._fullPath = props.fullPath;
		this._fs = props.fs;
	}

	get fs() : CustomFs {
		return this._fs;
	}

	set fs(value: CustomFs) {
		this._fs = value;
	}

	/**
	 * Whether this object represents a file or not.
	 * If `true`, this object may be cast to `InternalFile`.
	 * This is overridden by `InternalFile`.
	 */
	get file() : boolean {
		return false;
	}

	/**
	 * Whether this object represents a folder or not.
	 * If `true`, this object may be cast to `InternalFolder`.
	 * This is overridden by `InternalFolder`.
	 */
	get folder() : boolean {
		return false;
	}

	get name() : string {
		return this._name;
	}

	set name(value: string) {
		this._name = value;
	}

	get fullPath() : string {
		return this._fullPath;
	}

	set fullPath(value: string) {
		this._fullPath = value;
	}
}

/**
 * Internal representation of a read-writable file
 */
export class InternalFile extends AbstractInternalFile {
	private _content : string;

	constructor(props: InternalFileProps) {
		super(props);
		this._content = "";
	}

	/**
	 * Read the content of this file, and store the result.
	 * @returns	The content of this file, as a string
	 */
	async read() : Promise<string> {
		this._content = await _readfile(this.fullPath, this.fs);
		return this.content;
	}

	/**
	 * Writes the value of `this.content` as a string to this file.
	 */
	async write() : Promise<void> {
		await _writefile(this.fullPath, this.fs, this.content);
	}

	/**
	 * This is a file
	 */
	get file() : true {
		return true;
	}

	get content() : string {
		return this._content;
	}

	set content(value: string) {
		this._content = value;
	}
}

/**
 * Internal representation of a filesystem folder
 */
export class InternalFolder extends AbstractInternalFile {
	private _children : AbstractInternalFile[]|undefined;

	constructor(props: InternalFileProps) {
		super(props);
	}

	/**
	 * Read the immediate children of this directory, and save the result.
	 */
	async loadChildren() : Promise<AbstractInternalFile[]> {
		this._children = await _readdir(this.fullPath, this.fs, false);
		return this.children;
	}

	/**
	 * Return whether `this.loadChildren` has been called successfully yet
	 */
	get isLoaded() : boolean {
		return this._children !== undefined;
	}

	/**
	 * This is a folder
	 */
	get folder() : true {
		return true;
	}

	get children() : AbstractInternalFile[] {
		return this._children || [];
	}
}

/**
 * Create the correct internal object representation of a filesystem object from its path
 * @param filePath	The path to the file
 * @param fs		fs object to use to get the file information
 */
export async function pathToFile(filePath: string, fs?: CustomFs) : Promise<AbstractInternalFile> {
	fs = fs || await getFs();
	//Absolute path to the file
	filePath = path.resolve(filePath);
	//Read the file information
	let stats : Stats = await _stat(filePath, fs);
	//Common props for both file and folder
	const props : InternalFileProps = {
		fs: fs,
		name: path.basename(filePath),
		fullPath: filePath,
	};
	//Make a file if it is a file, a folder otherwise
	return stats.isFile() ? new InternalFile(props) : new InternalFolder(props);
}