const { _displayError, _exists } = require("../utils");
//eslint-disable-next-line @typescript-eslint/no-unused-vars
const { PluginFunctionParameters } = require("@whide/whide-types");

module.exports.name = "run_new_folder";
module.exports.args = [
	{
		name: "parent",
		description: "Folder to create the file in",
		type: 'folder',
	},
	{
		name: "name",
		description: "Name of the new folder",
		validator: function (name) {
			return name.match(/^[a-zA-Z0-9_ \-.]+$/);
		},
	}
];

/**
 * @param props {PluginFunctionParameters}
 * @returns {Promise<void>}
 */
module.exports.run = async function (props) {
	const {args, ioController, fs, path} = props;
	const parent = args["parent"];
	const name = args["name"];
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
