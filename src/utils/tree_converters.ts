import treeConverter, { BinaryTree, ConversionResultType, ConvertedBinaryTree, stringify } from "@whide/tree-lang";
import { TreeType } from "@/components/VariableTreeViewer.vue";

/**
 * Change a {@link BinaryTree} object to the displayable {@link TreeType}
 * @param binary	The binary tree to convert
 */
export function binaryTreeToDisplayable(binary: BinaryTree) : TreeType {
	//Display 'null' nodes as 'nil'
	if (binary === null) {
		return { name: 'nil', children: [], };
	}
	//Add the children
	let children: TreeType[] = [
		binaryTreeToDisplayable(binary.left),
		binaryTreeToDisplayable(binary.right),
	];
	//Return the created node
	return {
		name: '',
		children,
	};
}

/**
 * Change a {@link ConvertedBinaryTree} object to the displayable {@link TreeType}
 * @param conv		The ConvertedBinaryTree
 * @param error		(INTERNAL) Whether to display this subtree as an error
 * @param list		(INTERNAL) Whether to display this subtree as a list
 */
export function convertedTreeToDisplayable(conv: ConvertedBinaryTree, error = false, list = false) : TreeType {
	//Label the node 'nil' if it is null, or use its value
	let name: string|number = '';
	if (conv.value === null) name = 'nil';
	else if (conv.value !== undefined) name = conv.value;

	const isErrored = error || !!conv.error;

	//TODO: This is code to display lists in stringified form instead of tree
	//if (conv.list) {
	//	return {
	//		name: stringify(conv),
	//		list: list,
	//		errorMsg: conv.error,
	//		error: isErrored,
	//	};
	//}

	//Add the children
	let children: TreeType[] = [];
	for (let child of (conv.children || [])) {
		children.push(convertedTreeToDisplayable(child, isErrored, !!conv.list));
	}
	//Return the created node
	return {
		name: name,
		list: list,
		errorMsg: conv.error,
		error: isErrored,
		children,
	};
}

/**
 * Directly convert a {@link BinaryTree} to a human-readable string.
 * Defaults to displaying the tree as 'any' (a tree of only {@code nil}s)
 * @param tree		The tree to convert
 * @param converter	The string to use to display the tree
 */
export function stringifyTree(tree: BinaryTree, converter: string = 'any'): string {
	let res: ConversionResultType;
	//Attempt to run the conversion
	res = treeConverter(tree, converter);
	//Convert to a string
	return stringify(res.tree);
}