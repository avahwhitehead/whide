import { EventEmitter } from "events";
import {
	EditorController as EditorControllerInterface,
	ExtendedCodeEditorWrapper,
} from "@whide/whide-types";

/**
 *
 */
export default class EditorController extends EventEmitter implements EditorControllerInterface {
	/**
	 * The code editor object
	 */
	public readonly editor : ExtendedCodeEditorWrapper;

	/**
	 *
	 * @param editor	The code editor
	 */
	constructor(editor: ExtendedCodeEditorWrapper) {
		super();
		this.editor = editor;
	}

	//TODO: Allow control over tabs here
}