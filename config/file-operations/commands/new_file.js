const path = require("path");

module.exports.name = "run_new_file";
module.exports.args = [];

module.exports.run = async function ({editorController, ioController}) {
	try {
		console.log(`New File!`);
		let filePath = await ioController.getInput("Path to the file:", val => _validate(val));

		let fileStore = editorController.fileStore;
		const fileData = await fileStore.createFile(filePath);
		console.log(fileData);
	} catch (e) {
		console.error(e);
	}
}

function _validate(filePath) {
	return path.isAbsolute(filePath);
}
