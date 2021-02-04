import CodeMirror from "codemirror";

/**
 * Interface describing the wrapper around the code editor.
 *
 * This is based on {@link CodeMirror.Doc}.
 *
 * TODO: Simplify this interface and improve it for use by plugins
 */
export default interface CodeEditorWrapper {
	addLineWidget(line: any, node: HTMLElement, options?: CodeMirror.LineWidgetOptions): Promise<CodeMirror.LineWidget>;

	changeGeneration(closeEvent?: boolean): Promise<number>;

	clearHistory(): Promise<void>;

	copy(copyHistory: boolean): Promise<CodeMirror.Doc>;

	eachLine(f: ((line: CodeMirror.LineHandle) => void) | number, end?: number, f1?: (line: CodeMirror.LineHandle) => void): Promise<void>;

	extendSelection(from: CodeMirror.Position, to?: CodeMirror.Position): Promise<void>;

	findMarks(from: CodeMirror.Position, to: CodeMirror.Position): Promise<CodeMirror.TextMarker[]>;

	findMarksAt(pos: CodeMirror.Position): Promise<CodeMirror.TextMarker[]>;

	firstLine(): Promise<number>;

	getAllMarks(): Promise<CodeMirror.TextMarker[]>;

	getCursor(start?: string): Promise<CodeMirror.Position>;

	getEditor(): Promise<CodeMirror.Editor | null>;

	getHistory(): Promise<any>;

	getLine(n: number): Promise<string>;

	getLineHandle(num: number): Promise<CodeMirror.LineHandle>;

	getLineNumber(handle: CodeMirror.LineHandle): Promise<number | null>;

	getMode(): Promise<any>;

	getRange(from: CodeMirror.Position, to: CodeMirror.Position, seperator?: string): Promise<string>;

	getSelection(): Promise<string>;

	getSelections(lineSep?: string): Promise<Array<string>>;

	getValue(separator?: string): Promise<string>;

	historySize(): Promise<{ undo: number; redo: number }>;

	indexFromPos(object: CodeMirror.Position): Promise<number>;

	isClean(generation?: number): Promise<boolean>;

	iterLinkedDocs(fn: (doc: CodeMirror.Doc, sharedHist: boolean) => void): Promise<void>;

	lastLine(): Promise<number>;

	lineCount(): Promise<number>;

	lineSeparator(): Promise<string>;

	linkedDoc(options: { sharedHist?: boolean; from?: number; to?: number; mode: any }): Promise<CodeMirror.Doc>;

	listSelections(): Promise<CodeMirror.Range[]>;

	markClean(): Promise<void>;

	markText(from: CodeMirror.Position, to: CodeMirror.Position, options?: CodeMirror.TextMarkerOptions): Promise<CodeMirror.TextMarker>;

	posFromIndex(index: number): Promise<CodeMirror.Position>;

	redo(): Promise<void>;

	removeLine(n: number): Promise<void>;

	removeLineWidget(widget: CodeMirror.LineWidget): Promise<void>;

	replaceRange(replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position, origin?: string): Promise<void>;

	replaceSelection(replacement: string, collapse?: string): Promise<void>;

	replaceSelections(replacements: Array<string>, collapse?: string): Promise<void>;

	setBookmark(pos: CodeMirror.Position, options?: { widget?: HTMLElement; insertLeft?: boolean; shared?: boolean; handleMouseEvents?: boolean }): Promise<CodeMirror.TextMarker>;

	setCursor(pos: CodeMirror.Position | number, ch?: number, options?: { bias?: number; origin?: string; scroll?: boolean }): Promise<void>;

	setExtending(value: boolean): Promise<void>;

	setHistory(history: any): Promise<void>;

	setLine(n: number, text: string): Promise<void>;

	setSelection(anchor: CodeMirror.Position, head?: CodeMirror.Position, options?: { bias?: number; origin?: string; scroll?: boolean }): Promise<void>;

	setSelections(ranges: Array<{ anchor: CodeMirror.Position; head: CodeMirror.Position }>, primary?: number, options?: { bias?: number; origin?: string; scroll?: boolean }): Promise<void>;

	setValue(content: string): Promise<void>;

	somethingSelected(): Promise<boolean>;

	undo(): Promise<void>;

	unlinkDoc(doc: CodeMirror.Doc): Promise<void>;
}