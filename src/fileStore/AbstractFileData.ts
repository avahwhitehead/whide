import path from "path";

export class AbstractFileData {
	private _id: string = "";
	private _name: string = "";
	private _parent?: FolderData;
	private _metadata: Map<string,string>;


	/**
	 *
	 * @param id		File identifier
	 * @param name		File name
	 * @param parent?	Parent file
	 */
	constructor(id: string, name: string, parent?: FolderData) {
		this._id = id;
		this._name = name;
		this._parent = parent;
		this._metadata = new Map<string, string>();
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
}

/**
 * Represent a file
 */
export class FileData extends AbstractFileData {
	private _content?: string = undefined;

	constructor(id: string, name: string, parent?: FolderData, content: string = "") {
		super(id, name, parent);
		this._content = content;
	}

	get content() {
		return this._content || "";
	}

	set content(value) {
		this._content = value;
	}
}

export class FolderData extends AbstractFileData {
	private readonly _children: AbstractFileData[] = [];

	constructor(id: string, name: string, parent?: FolderData, children: AbstractFileData[] = []) {
		super(id, name, parent);
		this._children = children;
	}

	get children() {
		return this._children;
	}

	addChild(child : AbstractFileData) : void {
		this._children.push(child);
	}

	removeChild(child : AbstractFileData) : void {
		let index = this._children.indexOf(child);
		if (index >= 0) this._children.splice(index, 1);
	}
}