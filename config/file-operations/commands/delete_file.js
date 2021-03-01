const { _displayError } = require("../utils");

module.exports.name = "run_delete";
module.exports.args = [
	{
		name: "path",
		description: "File/Folder to delete",
		type: 'path',
	},
];

module.exports.run = async function ({args, ioController, fs}) {
	const filePath = args["path"];
	//Delete the file (or folder)
	fs.rm(filePath, { recursive: true }, err => {
		if (err) _displayError(ioController, err);
		else console.log(`Successfully created file "${filePath}"`);
	});
}
