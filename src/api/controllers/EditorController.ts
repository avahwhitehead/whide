import { EventEmitter } from "events";
import { FileStoreInterface } from "@/fileStore/FileStoreInterface";
import { CodeEditorWrapper } from "@/types/codeEditor";

/**
 *
 */
export default class EditorController extends EventEmitter {
	/**
	 * The code editor object
	 */
	public readonly editor : CodeEditorWrapper;
	public readonly fileStore : FileStoreInterface;

	/**
	 *
	 * @param editor	The code editor
	 * @param fileStore	The file store
	 */
	constructor(editor: CodeEditorWrapper, fileStore: FileStoreInterface) {
		super();
		this.editor = editor;
		this.fileStore = fileStore;
	}

	//TODO: Allow control over tabs here
}