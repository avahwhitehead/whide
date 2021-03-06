const { _displayError } = require("../utils");
//eslint-disable-next-line @typescript-eslint/no-unused-vars
const { PluginFunctionParameters } = require("@whide/whide-types");

module.exports.name = "run_delete";
module.exports.args = [
	{
		name: "path",
		description: "File/Folder to delete",
		type: 'path',
	},
];

/**
 * @param props {PluginFunctionParameters}
 * @returns {Promise<void>}
 */
module.exports.run = async function(props) {
	const { args, ioController, fs } = props;
	const filePath = args["path"];
	//See if the path is a file or a folder
	fs.stat(filePath, (err, stat) => {
		if (err) {
			if (err) _displayError(ioController, err);
			return;
		}
		//Callback when deleting completes
		const callback = (e) => {
			if (e) _displayError(ioController, e);
			else console.log(`Successfully deleted "${filePath}"`);
		};

		//Delete the file or folder at the path
		if (stat.isDirectory()) {
			fs.rmdir(filePath, callback);
		} else {
			fs.unlink(filePath, callback);
		}
	});
}
