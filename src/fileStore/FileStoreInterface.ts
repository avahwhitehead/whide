import { AbstractFileData, FileData, FolderData } from "@/fileStore/AbstractFileData";

/**
 * An interface defining the methods required by a file store object
 */
export interface FileStoreInterface {
	/**
	 * Create a new file
	 * @param name		The name of the file to create
	 * @param parent	The parent folder. Undefined means no parent.
	 * @returns	A FileData object representing the created file
	 */
	createFile(name: string, parent?: FolderData): Promise<FileData>;

	/**
	 * Create a new folder
	 * @param name		The name of the folder to create
	 * @param parent	The parent folder. Undefined means no parent.
	 * @returns	A FileData object representing the created folder
	 */
	createFolder(name: string, parent?: FolderData): Promise<FolderData>;

	/**
	 * Get a file or folder from a string path
	 * @param path	The path to the file/folder
	 */
	resolvePath(path: string) : Promise<AbstractFileData|undefined>;

	/**
	 * Read a file's contents from persistent storage into the provided object
	 * @param file	The file to read
	 * @returns file
	 */
	readFile(file: FileData): Promise<FileData>;

	/**
	 * Write a file to persistent storage
	 * @param file	The file to write
	 */
	writeFile(file: FileData): Promise<void>;

	/**
	 * Delete a file
	 * @param file	The file to delete
	 */
	deleteFile(file: AbstractFileData): Promise<void>;

	/**
	 *
	 * @param file
	 */
	getDirectoryTree(file?: AbstractFileData | undefined): Promise<AbstractFileData[]>;
}