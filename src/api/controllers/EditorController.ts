import CodeMirror from "codemirror";
import { EventEmitter } from "events";

/**
 *
 */
export default class EditorController extends EventEmitter {
	/**
	 * The code editor object
	 */
	private readonly _editor : CodeMirror.Editor;

	/**
	 *
	 * @param editor
	 */
	constructor(editor: CodeMirror.Editor) {
		super();
		this._editor = editor;
	}

	//TODO: Allow control over files here

	/**
	 * Get the code editor
	 */
	get editor(): CodeMirror.Editor {
		return this._editor;
	}
}