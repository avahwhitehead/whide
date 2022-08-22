import { FileInfoState } from "@/types/FileInfoState";
import CodeMirror, { LineHandle } from "codemirror";
import WHILE from "@/assets/whileSyntaxMode";
import BreakpointWidget from "@/components/_internal/codeEditor/BreakpointWidget";
import Vue from "vue";

/**
 * Configuration options for creating a {@link CustomMirrorDoc} object.
 */
export type CustomMirrorDocOptions = Partial<{
    /**
     * Language mode for the doc.
     * Defaults to WHILE.
     */
    mode: any;
    /**
     * See {@link CodeMirror.Doc}.
     */
    firstLineNumber: number;
    /**
     * See {@link CodeMirror.Doc}.
     */
    lineSep: string;
}>;

/**
 * Extension of the {@link CodeMirror.Doc} class.
 * Adds additional features to the Doc object.
 */
export class CustomMirrorDoc extends CodeMirror.Doc {
    /**
     * All the lines in the doc that have breakpoints
     * @private
     */
    private readonly _breakpoints: LineHandle[];
    /**
     * The {@link FileInfoState} object representing the file for this Doc
     * @private
     */
    private readonly _fileInfo: FileInfoState;

    /**
     * @param text      The initial text to add to the document
     * @param fileInfo  The file object using this Doc
     * @param opts      (Optional) Configuration options
     */
    constructor(text: string, fileInfo: FileInfoState, opts?: CustomMirrorDocOptions) {
        super(
            text,
            opts?.mode || WHILE,
            opts?.firstLineNumber,
            opts?.lineSep
        );
        this._breakpoints = [];
        this._fileInfo = fileInfo;
    }

    /**
     * Toggle a breakpoint on a line of the document.
     * The breakpoint is enabled if currently disabled, or disabled if enabled.
     * Use the {@code enabled} param to force enabling/disabling a breakpoint.
     * @param line      Line number or line handle to add/remove the breakpoint from
     * @param enabled   {true} Enable the breakpoint, or {@code false} to disable it.
     * @param enabled   {false} Disable the breakpoint.
     * @param enabled   {undefined} Decide automatically.
     * @returns {true}  If a breakpoint was added
     * @returns {false} If a breakpoint was removed
     * @returns {undefined} Only if an invalid line handler was provided
     */
    toggleBreakpoint(line: number|CodeMirror.LineHandle, enabled?: boolean) : boolean {
        if (typeof line === 'number') {
            //Get a line handle from the line number
            line = this.getLineHandle(line);
        } else {
            //Check the line handle is for this doc
            let info = this.getLineNumber(line);
            if (!info) return undefined!;
        }

        //Toggle the breakpoint if a state wasn't specified
        if (enabled === undefined) enabled = !this._breakpoints.includes(line);

        if (enabled) {
            //Make a new breakpoint marker
            const node: Vue = new BreakpointWidget();
            node.$mount();
            //Push the line to the list
            this._breakpoints.push(line);
            //Add the marker to the gutter
            //@ts-ignore
            this.setGutterMarker(line, "breakpoints", node.$el as HTMLElement);
        } else {
            //Remove the line from the list of breakpoints
            const index = this._breakpoints.indexOf(line);
            if (index >= 0) this._breakpoints.splice(index, 1);
            //Remove the marker from the gutter
            //@ts-ignore
            this.setGutterMarker(line, "breakpoints", null);
        }
        return enabled;
    }

    /**
     * The FileInfo object representing this document
     */
    get fileInfo(): FileInfoState {
        return this._fileInfo;
    }
    /**
     * List of all the breakpoints configured in the document.
     * Returns a list of {@link CodeMirror.LineHandle}s to each of the breakpoints.
     *
     * See also {@link breakpoints}.
     */
    get breakpointHandles(): CodeMirror.LineHandle[] {
        return this._breakpoints;
    }
    /**
     * List of all the breakpoints configured in the document.
     * Returns a list of line numbers representing each of the breakpoints.
     * Lines are 0-indexed.
     *
     * See also {@link breakpointHandles}.
     */
    get breakpoints(): number[] {
        return this._breakpoints.map((h: LineHandle) => this.getLineNumber(h)!);
    }
}