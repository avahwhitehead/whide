import path from "path";
import { FolderData } from "@/fileStore/internal/FolderData";

export class AbstractFileData {
	private _id: string = "";
	private _name: string = "";
	private _parent?: FolderData;
	private _metadata: Map<string,string>;
	private _type: "file"|"folder";

	/**
	 *
	 * @param id		File identifier
	 * @param name		File name
	 * @param type		String representing whether this is a file or a folder.
	 * @param parent?	Parent file
	 */
	constructor(id: string, name: string, type: "file" | "folder", parent?: FolderData) {
		this._id = id;
		this._name = name;
		this._parent = parent;
		this._metadata = new Map<string, string>();
		this._type = type;
	}

	/**
	 * Get the path through the directory tree to the current file
	 * @return string file path in the format `/grandparent/parent/child.ext`
	 */
	toPath() : string {
		return path.join(
			(this._parent ? this._parent.toPath() : ""),
			this._name
		);
	}

	get name() {
		return this._name;
	}

	set name(value) {
		this._name = value;
	}

	get parent() {
		return this._parent;
	}

	set parent(value) {
		this._parent = value;
	}

	get id() {
		return this._id;
	}

	set id(value) {
		this._id = value;
	}

	get metadata() : Map<string, string> {
		return this._metadata;
	}

	set metadata(value: Map<string, string>) {
		this._metadata = value;
	}

	get type(): string {
		return this._type;
	}
}

