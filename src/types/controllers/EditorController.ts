import { EventEmitter } from "events";
import CodeMirror from "codemirror";

export interface EditorController extends EventEmitter {
	/**
	 * The code editor
	 */
	readonly editor : CodeMirror.Editor;
	/**
	 * The currently focused file in the editor
 	 */
	readonly focusedFile? : string;
	/**
	 * The opened file tabs in the editor
 	 */
	readonly openFiles : string[];

	/**
	 * Open the file at the given path in a new tab in the editor, and focus on it.
	 * Only focuses if the file is already open.
 	 * @param filePath	The file path to open
	 */
	open(filePath: string) : Promise<void>;

	/**
	 * Close this file's editor tab
	 * @param filePath	The path to the file to close
	 */
	close(filePath: string) : Promise<void>;

	/**
	 * Save all the open files
	 */
	saveFiles() : Promise<void>;

	/**
	 * Toggle (or enable/disable) a breakpoint on a line in the editor
	 * @param line		The line to enable/disable
	 * @param enabled	{@code undefined} to toggle the line's breakpoint.
	 * 					{@code true} or ${@code false} to enable/disable the breakpoint.
	 */
	toggleBreakpoint(line: number|CodeMirror.LineHandle, enabled?: boolean) : void;

	/**
	 * Get a list of all the breakpoints in the editor
	 */
	getBreakpoints(): number[];
}