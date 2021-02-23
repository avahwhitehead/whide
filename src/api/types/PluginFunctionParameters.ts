import EditorController from "@/api/controllers/EditorController";
import IOController from "@/api/types/IOController";

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
}
