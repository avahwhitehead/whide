import { CustomMirrorDoc, CustomMirrorDocOptions } from "@/types/CustomMirrorDoc";
import EventEmitter from "events";

/**
 * Configuration options for creating a {@link FileInfoState} object.
 */
export type FileInfoStateOptions = Partial<{
    /**
     * Whether the file should be marked as modified
     */
    modified: boolean;
    /**
     * The breakpoints to set up in the document
     */
    breakpoints: number[];
    /**
     * Whether the file should be shown as extended WHILE.
     * * {@code true}     for Extended WHILE.
     * * {@code false}    for Pure WHILE.
     */
    extWhile: boolean;
    /**
     * Options to use to create the CodeMirror document.
     * Also a {@code text} option to set the initial doc content
     */
    docOptions: CustomMirrorDocOptions & { text?: string };
}>;

/**
 * Information about a file opened in an editor tab.
 */
export class FileInfoState extends EventEmitter {
    /**
     * The CodeMirror Doc object containing the file content
     * @private
     */
    private _doc: CustomMirrorDoc;
    /**
     * Whether the file has unsaved changes
     * @private
     */
    private _modified: boolean;
    /**
     * The name of the file to display in (e.g.) editor tabs
     * @private
     */
    private _name: string;
    /**
     * Full path to the file
     * @private
     */
    private _path: string;
    /**
     * Whether to display this file as extended WHILE
     * @private
     */
    private _extWhile: boolean;

    private _secondEditorContent: string|undefined;
    private _secondEditorDisplayMode: 'NOTHING'|'PURE_WHILE'|'SHOW_PAD';
    private _secondEditorLiveMode: boolean;

    /**
     * @param name      Name of the file
     * @param path      Path to the file
     * @param options   (Optional) configuration objects for the file
     */
    constructor(name: string, path: string, options?: FileInfoStateOptions) {
        super();

        if (!options) options = {
            extWhile: true,
            modified: false,
            breakpoints: [],
            docOptions: {},
        };

        this._name = name;
        this._path = path;
        this._modified = (options.modified !== undefined) ? options.modified : false;
        this._extWhile = (options.extWhile === undefined) ? true : options.extWhile;

        this._secondEditorDisplayMode = 'NOTHING';
        this._secondEditorLiveMode = false;

        //Create a new CodeMirror Doc
        this._doc = new CustomMirrorDoc(options.docOptions?.text || '', this, options.docOptions);
    }

    get name(): string {
        return this._name;
    }
    set name(value: string) {
        this._name = value;
        this.emit('name', value);
    }
    get modified(): boolean {
        return this._modified;
    }
    set modified(value: boolean) {
        this._modified = value;
        this.emit('modified', value);
    }
    get doc(): CustomMirrorDoc {
        return this._doc;
    }
    set doc(value: CustomMirrorDoc) {
        this._doc = value;
        this.emit('doc', value);
    }

    /**
     * List of all the breakpoints configured for the file.
     * @returns {number[]}  List of lines which have a breakpoint configured.
     *                      Lines are 0-indexed.
     */
    get breakpoints(): number[] {
        return this._doc.breakpoints;
    }
    get path(): string {
        return this._path;
    }
    set path(value: string) {
        this._path = value;
        this.emit('path', value);
    }

    get extWhile(): boolean {
        return this._extWhile;
    }
    set extWhile(value: boolean) {
        this._extWhile = value;
        this.emit('extWhile', value);
    }

    get secondEditorContent(): string|undefined {
        return this._secondEditorContent;
    }
    set secondEditorContent(value: string|undefined) {
        this._secondEditorContent = value;
        this.emit('secondEditorContent', value);
    }

    get secondEditorDisplayMode(): 'NOTHING'|'PURE_WHILE'|'SHOW_PAD' {
        return this._secondEditorDisplayMode;
    }
    set secondEditorDisplayMode(value: 'NOTHING'|'PURE_WHILE'|'SHOW_PAD') {
        this._secondEditorDisplayMode = value;
        this.emit('secondEditorDisplayMode', value);
    }

    get secondEditorLiveMode(): boolean {
        return this._secondEditorLiveMode;
    }
    set secondEditorLiveMode(value: boolean) {
        this._secondEditorLiveMode = value;
        this.emit('secondEditorLiveMode', value);
    }
}