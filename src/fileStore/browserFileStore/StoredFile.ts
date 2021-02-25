/**
 * The type of files which are stored in browser storage
 */
export interface StoredFile {
	id?: string;
	name?: string;
	children?: StoredFile[];
}