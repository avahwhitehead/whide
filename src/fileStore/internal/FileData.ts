import { AbstractFileData} from "@/fileStore/internal/AbstractFileData";
import { FolderData } from "@/fileStore/internal/FolderData";

/**
 * Represent a file
 */
export class FileData extends AbstractFileData {
	private _content?: string = undefined;

	constructor(id: string, name: string, parent?: FolderData, content: string = "") {
		super(id, name, "file", parent);
		this._content = content;
	}

	get content() {
		return this._content || "";
	}

	set content(value) {
		this._content = value;
	}
}