const path = require("path");

module.exports.name = "run_delete";
module.exports.args = [{
	name: "file_path",
	description: "The full path to the file/folder to delete, relative to the project root",
	validator: filePath => path.isAbsolute(filePath),
}];

module.exports.run = async function ({args, ioController, editorController}) {
	let fileStore = editorController.fileStore;

	try {
		//Get the file path
		const full_path = args["file_path"];

		//Get the parent folder
		let obj = await fileStore.resolvePath(full_path);
		//Check the parent exists
		if (!obj) {
			_displayError(ioController, `The file at "${full_path}" doesn't exist`);
			return;
		}
		//Delete the file
		await fileStore.deleteFile(obj);
	} catch (e) {
		_displayError(ioController, e);
	}
}

function _displayError(ioController, error) {
	console.error(error);
	ioController.showOutput({
		message: error,
		title: "An error occurred"
	});
}
