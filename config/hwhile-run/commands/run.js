import tmp from "tmp";
import fs  from "fs";
import path from "path";
import { HWhileConnector } from "@whide/hwhile-wrapper";

export const name = "run_code";
export const args = [];

export async function run({ editorController, ioController, runPanelController }) {
	const code = await editorController.editor.getValue();

	let name = await ioController.getInput({
		message: "File name to use",
		title: "File name",
	});
	if (!name) {
		await ioController.showOutput({title:"Cancelled Run"});
		return;
	}
	let expr = await ioController.getInput({
		message: "Expression to pass as input to the program",
		title: "Argument expression",
	});
	if (!expr) {
		await ioController.showOutput({title:"Cancelled Run"});
		return;
	}

	const tmp_folder = tmp.dirSync();
	const folder_path = tmp_folder.name;
	console.log('Dir: ', folder_path);

	fs.writeFileSync(path.join(folder_path, name), code);

	const hWhileConnector = new HWhileConnector({
		hwhile: "hwhile",
		cwd: folder_path,
	});

	let instanceController = await runPanelController.addOutputStream();

	let shell = hWhileConnector.run(name, expr, false);

	shell.stdout.on("data", data => instanceController.stream.write(data.toString()));
	shell.on('error', error => console.log(` error: ${error.message}`));
	shell.on("close", code => console.log(`child process exited with code ${code}`));
}
