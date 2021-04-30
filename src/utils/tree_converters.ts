import { BinaryTree } from "@whide/hwhile-wrapper";
import { ConvertedBinaryTree } from "@whide/tree-lang";
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