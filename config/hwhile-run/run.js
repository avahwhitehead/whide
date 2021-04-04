const { HWhileConnector } = require("@whide/hwhile-wrapper");

module.exports.name = "run_code";
module.exports.args = [{
	name: "expression",
	description: "Expression to pass as input to the program",
	type: "string",
}];

module.exports.run = async function({ args, config, editorController, ioController, runPanelController, path }) {
	//The input expression
	const expr = args["expression"];
	//Run the currently focused file
	const filePath = editorController.focusedFile;

	//Stop here if there are no files open
	if (!filePath) {
		ioController.showOutput({
			message: "Please open a file and try again",
			title: "No file to debug",
		});
		return;
	}

	//Get the file name and parent directory
	const file_name = path.basename(filePath);
	const folder_path = path.dirname(filePath);

	//Start the interpreter in the same directory as the file
	const hWhileConnector = new HWhileConnector({
		hwhile: config['hwhile-path'],
		cwd: folder_path,
	});

	//Pass interpreter output straight to the output console
	let instanceController = await runPanelController.addOutputStream(file_name);

	//Run the file
	let shell = hWhileConnector.run(file_name, expr, false);

	//Pass interpreter output straight to the output console
	shell.stdout.on("data", data => instanceController.stream.write(data.toString()));
	//Handle errors/close
	shell.on('error', error => console.log(` error: ${error.message}`));
	shell.on("close", () => instanceController.stream.end());
}
