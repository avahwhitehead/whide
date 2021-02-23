import EditorController from "@/api/controllers/EditorController";
import IOController from "@/api/types/IOController";
import RunPanelController from "@/api/controllers/RunPanelController";

/**
 * Hold the parameters to pass to the function when it's called.
 */
export default interface PluginFunctionParameters {
	/**
	 * The argument values as `name: value` pairs
	 */
	args: {[key: string]: string},
	/**
	 * The code editor object
	 */
	editorController: EditorController,
	/**
	 * Object allowing user input/output
	 */
	ioController: IOController,
	/**
	 * Object allowing output to the run panel
	 */
	debuggerOutputController : RunPanelController,
}
