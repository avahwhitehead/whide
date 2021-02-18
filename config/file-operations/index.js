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
		]
	}
];

export default [
	open,
	new_file,
	new_folder,
	delete_file,
];