import open from "./commands/open";
import new_file from "./commands/new_file";
import new_folder from "./commands/new_folder";
import delete_file from "./commands/delete_file";

export const menus = [
	{
		"name": "File",
		"children": [
			{ "name": "Open", "command": "run_open" },
			{
				"name": "New",
				"children": [
					{ "name": "New File", "command": "run_new_file" },
					{ "name": "New Folder", "command": "run_new_folder" }
				]
			},
			{ "name": "Delete", "command": "run_delete" },
			{ "name": "Save", "command": "run_save" },
			{ "name": "Close", "command": "run_close" }
		]
	},
	{
		"name": "Run",
		"children": [
			{ "name": "Run", "command": "run_code" },
			{ "name": "Debug", "command": "run_code" }
		]
	}
];

export default [
	open,
	new_file,
	new_folder,
	delete_file,
];