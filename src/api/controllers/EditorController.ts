import CodeMirror from "codemirror";
import { EventEmitter } from "events";
import { FileStoreInterface } from "@/fileStore/FileStoreInterface";

/**
 *
 */
export default class EditorController extends EventEmitter {
	/**
	 * The code editor object
	 */
	private readonly _editor : CodeMirror.Editor;
	private readonly _fileStore : FileStoreInterface;

	/**
	 *
	 * @param editor	The code editor
	 * @param fileStore	The file store
	 */
	constructor(editor: CodeMirror.Editor, fileStore: FileStoreInterface) {
		super();
		this._editor = editor;
		this._fileStore = fileStore;
	}

	//TODO: Allow control over files here

	/**
	 * Get the code editor
	 */
	get editor(): CodeMirror.Editor {
		return this._editor;
	}

	/**
	 * Get the file store controller
	 */
	get fileStore(): FileStoreInterface {
		return this._fileStore;
	}
}