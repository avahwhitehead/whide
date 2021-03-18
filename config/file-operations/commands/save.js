module.exports.name = "run_save";
module.exports.args = [];

module.exports.run = async function ({editorController}) {
	await editorController.saveFiles();
}
