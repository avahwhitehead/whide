const HWhile = require("@whide/hwhile-wrapper/src/index");

module.exports.converters = [
	{
		name: 'tree string',
		convert: (tree) => {
			return HWhile.TreeStringConverter.tree_to_string(tree);
		},
	},
	{
		name: 'integer',
		convert: (tree) => {
			return HWhile.IntegerTreeConverter.to_integer(tree).toString();
		},
	},
	{
		name: 'list of integers',
		convert: (tree) => {
			return `[${HWhile.NumberListConverter.tree_to_list(tree).join(', ')}]`;
		},
	},
	{
		name: 'list of lists of integers',
		convert: (tree) => {
			const to_list_list = (tree, lst) => {
				if (!tree) return lst;
				lst.push(`[${HWhile.NumberListConverter.tree_to_list(tree.left).join(', ')}]`)
				return to_list_list(tree.right, lst);
			};
			return `[${to_list_list(tree, []).join(', ')}]`;
		},
	},
	{
		name: 'tree of lists of integers',
		convert: (tree) => {
			const to_list_tree = (tree) => {
				if (!tree) return tree;
				return {
					left: `[${HWhile.NumberListConverter.tree_to_list(tree.left).join(', ')}]`,
					right: to_list_tree(tree.right),
				};
			};
			return to_list_tree(tree);
		},
	},
];