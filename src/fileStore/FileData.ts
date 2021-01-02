import path from "path";
import { StoredFile } from "@/fileStore/StoredFile";

export class FileData {
	private _id: string = "";
	private _name: string = "";
	private _parent: FileData|undefined = undefined;
	private _content?: string = undefined;
	private _metadata: Map<string,string>;
	private readonly _children: FileData[] = [];


	/**
	 *
	 * @param id		File identifier
	 * @param name		File name
	 * @param parent?	Parent file
	 * @param children	Any children to this file
	 */
	constructor(id: string, name: string, parent?: FileData, children: FileData[] = []) {
		this._id = id;
		this._name = name;
		this._parent = parent;
		this._children = children;
		this._content = undefined;
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

	get content() {
		return this._content || "";
	}

	set content(value) {
		this._content = value;
	}

	get children() {
		return this._children;
	}

	get metadata() : Map<string, string> {
		return this._metadata;
	}

	set metadata(value: Map<string, string>) {
		this._metadata = value;
	}

	addChild(child : FileData) : void {
		this._children.push(child);
	}

	removeChild(child : FileData) : void {
		let index = this._children.indexOf(child);
		if (index >= 0) this._children.splice(index, 1);
	}
}
