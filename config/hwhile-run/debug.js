const path = require('path');
const { InteractiveHWhileConnector } = require("@whide/hwhile-wrapper");

module.exports.name = "debug_code";
module.exports.args = [{
	name: "Input Expression",
	description: "Expression to pass as input to the program",
	type: "string",
}];

/**
 * Run the program until the next breakpoint, or until the program ends.
 * @param hWhileConnector {InteractiveHWhileConnector}	The hwhile connector instance
 * @param instanceController							The output panel instance controller
 * @param prog_name	{string}							The name of the program
 */
async function run(hWhileConnector, instanceController, prog_name) {
	let result = await hWhileConnector.run(true);
	await updateVars(hWhileConnector, instanceController, prog_name);
	if (result.cause === 'done') {
		await stop(hWhileConnector, instanceController);
	}
}

/**
 * Step to the next line of the program
 * @param hWhileConnector {InteractiveHWhileConnector}	The hwhile connector instance
 * @param instanceController							The output panel instance controller
 * @param prog_name	{string}							The name of the program
 */
async function step(hWhileConnector, instanceController, prog_name) {
	let result = await hWhileConnector.step(true);
	await updateVars(hWhileConnector, instanceController, prog_name);
	if (result.cause === 'done') {
		await stop(hWhileConnector, instanceController);
	}
}

/**
 * Stop executing the program, and terminate the HWhile process
 * @param hWhileConnector {InteractiveHWhileConnector}	The hwhile connector instance
 * @param instanceController							The output panel instance controller
 */
async function stop(hWhileConnector, instanceController) {
	//Stop the interpreter
	await hWhileConnector.stop();
	//Close the output stream
	instanceController.stream.end();
}

/**
 * Update the stored variable values
 * @param hWhileConnector {InteractiveHWhileConnector}	The hwhile connector instance
 * @param instanceController							The output panel instance controller
 * @param prog_name	{string}							The name of the program
 */
async function updateVars(hWhileConnector, instanceController, prog_name) {
	let vars = await hWhileConnector.store(false);
	instanceController.variables = {};
	let cur_vars = vars.get(prog_name);
	if (!cur_vars) return;
	for (let v of cur_vars.keys()) instanceController.variables[v] = cur_vars.get(v);
}

module.exports.run = async function({ args, config, editorController, ioController, runPanelController }) {
	//The input expression
	const expr = args["Input Expression"];
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

	if (!config['hwhile-path']) {
		ioController.showOutput({
			message: "Please set the HWhile path in settings.",
			title: "Path to HWhile not specified",
		});
		return;
	}

	//Get the file name and program name
	const file_name = path.basename(filePath);
	const prog_name = file_name.split('.')[0];

	//Start the interpreter in the same directory as the file
	const folder_path = path.dirname(filePath);
	const hWhileConnector = new InteractiveHWhileConnector({
		hwhile: config["hwhile-path"],
		cwd: folder_path,
	});

	//Pass interpreter output straight to the output console
	let instanceController = await runPanelController.addOutputStream(file_name);
	hWhileConnector.on("output", data => instanceController.stream.write(data.toString()));

	//Handle debugger controller button events
	instanceController.debuggerCallbackHandler = {
		run: () => run(hWhileConnector, instanceController, prog_name),
		step: () => step(hWhileConnector, instanceController, prog_name),
		stop: () => stop(hWhileConnector, instanceController),
	};

	//Initialise the stored variable values to be empty
	instanceController.variables = {};

	//Start the interpreter
	await hWhileConnector.start();
	//Load the chosen program
	await hWhileConnector.load(prog_name, expr, true);

	//Setup the program breakpoints
	const breakpoints = await editorController.editor.getBreakpoints();
	for (let b of breakpoints) {
		await hWhileConnector.addBreakpoint(b, false, true);
	}

	//Run the program until it hits the next breakpoint
	await run(hWhileConnector, instanceController, prog_name);
}
