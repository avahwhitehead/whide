import { FileData } from "@/fileStore/FileData";

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
	createFile(name: string, parent?: FileData): Promise<FileData>;

	/**
	 * Create a new folder
	 * @param name		The name of the folder to create
	 * @param parent	The parent folder. Undefined means no parent.
	 * @returns	A FileData object representing the created folder
	 */
	createFolder(name: string, parent?: FileData): Promise<FileData>;

	/**
	 * Read a file's contents from persistent storage into the provided object
	 * @param file	The file to read
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
	deleteFile(file: FileData): Promise<void>;

	/**
	 *
	 * @param file
	 */
	getDirectoryTree(file?: FileData | undefined): Promise<FileData[]>;
}