import { CustomFs, CustomFsContainer, getFsContainer } from "@/files/fs";
import { Stats } from "fs";

/**
 * Promisified wrapper around `fs.stat`.
 * @param filePath	Path to the file
 * @param fs		The fs object to use
 */
async function _stat(filePath: string, fs: CustomFs) : Promise<Stats> {
	return new Promise<Stats>((resolve, reject) => {
		fs.stat(filePath, (err: any, stats: Stats) => {
			if (err) reject(err);
			else resolve(stats);
		})
	});
}

/**
 * Promisified wrapper around `fs.readdir`, returning to `AbstractInternalFile` objects instead of strings.
 * @param dir		Path to the file
 * @param fsContainer	The filessystem objects to use
 * @param hiddenFiles	Whether to show hidden files
 */
async function _readdir(dir: string, fsContainer: CustomFsContainer, hiddenFiles: boolean = false) : Promise<AbstractInternalFile[]> {
	const { fs, path } = fsContainer;
	return new Promise<AbstractInternalFile[]>((resolve, reject) => {
		//Read the files in the folder as a string
		fs.readdir(dir, async (err: any, files: string[]) => {
			//Error on error
			if (err) reject(err);
			else {
				if (!hiddenFiles) {
					//Filter out hidden files
					files = files.filter(f => f.charAt(0) !== '.');
				}
				//Convert file names to the internal representation
				let internalFiles : AbstractInternalFile[] = [];
				for (let file of files) {
					const filePath = path.join(dir, file);
					internalFiles.push(await pathToFile(filePath, fsContainer));
				}
				//Return the file list
				resolve(internalFiles);
			}
		})
	});
}

/**
 * Promisified wrapper around `fs.readfile`.
 * @param filePath	Path to the file
 * @param container	The filesystem modules to use
 */
async function _readfile(filePath: string, container: CustomFsContainer) : Promise<string> {
	return new Promise<string>((resolve, reject) => {
		container.fs.readFile(filePath, (err : any, data : Buffer) => {
			if (err) reject(err);
			else resolve(data.toString());
		})
	});
}

/**
 * Promisified wrapper around `fs.writefile`.
 * @param filePath	Path to the file
 * @param container	The filesystem modules to use
 * @param content	The content to write
 */
async function _writefile(filePath: string, container: CustomFsContainer, content: string) : Promise<void> {
	return new Promise<void>((resolve, reject) => {
		container.fs.writeFile(filePath, content, (err : any) => {
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
	 * The filesystem modules to use when reading/writing etc
	 */
	fsContainer: CustomFsContainer;
}

/**
 * Parent class representing any file system object
 */
export abstract class AbstractInternalFile {
	private _name : string;
	private _fullPath : string;
	private _fsContainer: CustomFsContainer;

	protected constructor(props : InternalFileProps) {
		this._name = props.name;
		this._fullPath = props.fullPath;
		this._fsContainer = props.fsContainer;
	}

	get fsContainer() : CustomFsContainer {
		return this._fsContainer;
	}

	set fsContainer(value: CustomFsContainer) {
		this._fsContainer = value;
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
		this._content = await _readfile(this.fullPath, this.fsContainer);
		return this.content;
	}

	/**
	 * Writes the value of `this.content` as a string to this file.
	 */
	async write() : Promise<void> {
		await _writefile(this.fullPath, this.fsContainer, this.content);
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
		this._children = await _readdir(this.fullPath, this.fsContainer, false);
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
 * @param container	The filesystem modules to use to get the file information
 */
export async function pathToFile(filePath: string, container?: CustomFsContainer) : Promise<AbstractInternalFile> {
	container = container || await getFsContainer();
	//Absolute path to the file
	filePath = container.path.resolve(filePath);
	//Read the file information
	let stats : Stats = await _stat(filePath, container.fs);
	//Common props for both file and folder
	const props : InternalFileProps = {
		fsContainer: container,
		name: container.path.basename(filePath),
		fullPath: filePath,
	};
	//Make a file if it is a file, a folder otherwise
	return stats.isFile() ? new InternalFile(props) : new InternalFolder(props);
}