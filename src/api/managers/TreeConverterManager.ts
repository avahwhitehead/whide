import { ExtendedBinaryTree } from "@/api/types/ExtendedBinaryTree";
import { BinaryTree } from "@whide/hwhile-wrapper";

export type TreeConverter = {
	name: string,
	convert: (tree: BinaryTree) => ExtendedBinaryTree;
};

/**
 * Manage the tree converters
 */
export class TreeConverterManager {
	readonly _converters : TreeConverter[];

	constructor() {
		this._converters = [];
	}

	/**
	 * All the converters currently available
	 */
	get converters() : TreeConverter[] {
		return this._converters;
	}

	/**
	 * Make a new converter available
	 * @param converter		The converter to add
	 */
	register(converter: TreeConverter) : void {
		this._converters.push(converter);
	}

	/**
	 * Remove a converter
	 * @param converter		The converter to remove
	 */
	unregister(converter: TreeConverter): void {
		const index = this._converters.indexOf(converter);
		if (index === -1) return;
		this._converters.splice(index, 1);
	}
}
