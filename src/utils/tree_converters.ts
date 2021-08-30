import treeConverter, { BinaryTree, ConversionResultType, ConvertedBinaryTree, stringify } from "@whide/tree-lang";
import { TreeType } from "@/components/VariableTreeViewer.vue";

/**
 * Change a {@link BinaryTree} object to the displayable {@link TreeType}.
 * @param tree		The binary tree to convert
 * @returns {TreeType}	The converted tree
 */
export function binaryTreeToDisplayable(tree: BinaryTree): TreeType;
/**
 * Change a {@link BinaryTree} object to the displayable {@link TreeType},
 * and convert the tree using a conversion string at the same time.
 * @param tree		The binary tree to convert
 * @param converter	Conversion string to modify the tree
 * @returns {TreeType}	The converted tree
 * @returns {string}	Error message which caused the conversion to fail
 */
export function binaryTreeToDisplayable(tree: BinaryTree, converter: string): TreeType|string;
export function binaryTreeToDisplayable(tree: BinaryTree, converter?: string): TreeType|string {
	converter = converter || 'any';

	//Attempt to convert the tree using the input tree
	let convertedTree: ConversionResultType | string;
	try {
		//Attempt to run the conversion
		convertedTree = treeConverter(tree, converter);
	} catch (e) {
		//Return the errors
		convertedTree = (e as Error).message;
	}

	//Return the tree as a `TreeType` if it is successful
	if (typeof convertedTree !== 'string') return convertedTreeToDisplayable(convertedTree.tree);
	//Return the error message otherwise
	else return convertedTree;
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
