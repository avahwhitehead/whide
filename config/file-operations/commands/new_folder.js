const { _displayError, _exists } = require("../utils");
const path = require('path');

module.exports.name = "run_new_folder";
module.exports.args = [
	{
		name: "Parent Folder",
		description: "Choose the folder to hold the file",
		type: 'folder',
	},
	{
		name: "Folder Name",
		description: "Name of the file",
		validator: function (name) {
			return name.match(/^[a-zA-Z0-9_ \-.]+$/);
		},
	}
];

module.exports.run = async function ({args, ioController, fs}) {
	const parent = args["Parent Folder"];
	const name = args["Folder Name"];
	//Build the full directory path
	const full_path = path.join(parent, name);

	try {
		//Check the folder doesn't already exist
		if (await _exists(full_path, fs)) {
			_displayError(ioController, `The folder "${full_path}" already exists`);
			return;
		}
		//Create the folder
		fs.mkdir(full_path, err => {
			if (err) _displayError(ioController, err);
			else console.log(`Successfully created ${full_path}`);
		});
	} catch (e) {
		_displayError(ioController, e);
	}
}
