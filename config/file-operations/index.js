import new_file from "./commands/new_file";
import new_folder from "./commands/new_folder";
import delete_file from "./commands/delete_file";
import save from "./commands/save";

export const menus = [
	{
		"name": "File",
		"children": [
			{
				"name": "New",
				"children": [
					{ "name": "New File", "command": "run_new_file" },
					{ "name": "New Folder", "command": "run_new_folder" }
				]
			},
			{ "name": "Save", "command": "run_save" },
			//{ "name": "Download", "command": "run_download" },
			//{ "name": "Rename", "command": "run_rename" },
			//{ "name": "Move", "command": "run_move" },
			{ "name": "Delete", "command": "run_delete" },
		]
	}
];

export default [
	new_file,
	new_folder,
	delete_file,
	save,
];