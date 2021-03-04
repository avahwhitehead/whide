const { _displayError, _exists } = require("../utils");

module.exports.name = "run_new_file";
module.exports.args = [
	{
		name: "parent",
		description: "Folder to create the file in",
		type: 'folder',
	},
	{
		name: "name",
		description: "Name of the new file",
		validator: function (name) {
			return name.match(/^[a-zA-Z0-9_ \-.]+$/);
		},
	}
];

module.exports.run = async function ({args, ioController, fs, path}) {
	const parent = args["parent"];
	const name = args["name"];
	//Build the full file path
	const full_path = path.join(parent, name);

	try {
		//Check the file doesn't already exist
		if (await _exists(full_path, fs)) {
			_displayError(ioController, `The file "${name}" already exists in "${parent}"`);
			return;
		}
		//Create the file
		fs.writeFile(full_path, "", err => {
			if (err) _displayError(ioController, err);
			else console.log(`Successfully created file "${full_path}"`);
		});
	} catch (e) {
		_displayError(ioController, e);
	}
}
