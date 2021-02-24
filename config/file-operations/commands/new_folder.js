const path = require("path");

module.exports.name = "run_new_folder";
module.exports.args = [{
	name: "folder_path",
	description: "The full path to the folder to add, relative to the project root",
	validator: function (filePath) {
		return path.isAbsolute(filePath);
	},
}];

module.exports.run = async function ({args, ioController, editorController}) {
	let fileStore = editorController.fileStore;

	try {
		//Get the folder path
		const full_path = path.join('/', args["file_path"]);

		//Separate file name, and parent path
		let name = path.basename(full_path);
		let parent_path = path.resolve(full_path, '..');

		//Get the parent folder
		let parentObj = await fileStore.resolvePath(parent_path);
		//Check the parent exists
		if (!parentObj) {
			_displayError(ioController, `The folder at "${parent_path}" doesn't exist`);
			return;
		}
		//Check the parent is a folder
		if (parentObj.type !== "folder") {
			_displayError(ioController, `The parent at "${parent_path}" is not a folder`);
			return;
		}
		//Create the file
		await fileStore.createFolder(name, parentObj);
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
