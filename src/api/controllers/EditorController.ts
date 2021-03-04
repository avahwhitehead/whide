import { EventEmitter } from "events";
import { CodeEditorWrapper } from "@/types/codeEditor";

/**
 *
 */
export default class EditorController extends EventEmitter {
	/**
	 * The code editor object
	 */
	public readonly editor : CodeEditorWrapper;

	/**
	 *
	 * @param editor	The code editor
	 */
	constructor(editor: CodeEditorWrapper) {
		super();
		this.editor = editor;
	}

	//TODO: Allow control over tabs here
}