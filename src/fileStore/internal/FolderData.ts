import { AbstractFileData } from "@/fileStore/internal/AbstractFileData";

export class FolderData extends AbstractFileData {
	private readonly _children: AbstractFileData[] = [];

	constructor(id: string, name: string, parent?: FolderData, children: AbstractFileData[] = []) {
		super(id, name, "folder", parent);
		this._children = children;
	}

	get children() {
		return this._children;
	}

	addChild(child: AbstractFileData): void {
		this._children.push(child);
	}

	removeChild(child: AbstractFileData): void {
		let index = this._children.indexOf(child);
		if (index >= 0) this._children.splice(index, 1);
	}
}