import CodeMirror from "codemirror";
import CodeEditorWrapper from "./CodeEditorWrapper";

/**
 * Build a wrapper around a code editor object so that it can be used in plugins.
 * This is required due to a "quirk" of electron's {@code remote.require} method which runs all callback functions as asynchronous
 * even if they are not.
 *
 * See: https://trello.com/c/mWblT66d and https://www.electronjs.org/docs/api/remote#passing-callbacks-to-the-main-process
 *
 * @param _editor	The editor object to wrap
 */
export default function wrapEditor(_editor : CodeMirror.Editor) : CodeEditorWrapper {
	return {
		addLineWidget: async (line: any, node: HTMLElement, options?: CodeMirror.LineWidgetOptions): Promise<CodeMirror.LineWidget> => {
			return _editor.addLineWidget(line, node, options);
		},

		changeGeneration: async (closeEvent?: boolean): Promise<number> => {
			return _editor.changeGeneration(closeEvent);
		},

		clearHistory: async (): Promise<void> => {
			_editor.clearHistory();
		},

		copy: async (copyHistory: boolean): Promise<CodeMirror.Doc> => {
			return _editor.copy(copyHistory);
		},

		eachLine: async (f: ((line: CodeMirror.LineHandle) => void) | number, end?: number, f1?: (line: CodeMirror.LineHandle) => void): Promise<void> => {
			if (typeof f !== "number") _editor.eachLine(f);
			else _editor.eachLine(f, end!, f1!);
		},

		extendSelection: async (from: CodeMirror.Position, to?: CodeMirror.Position): Promise<void> => {
			_editor.extendSelection(from, to);
		},

		findMarks: async (from: CodeMirror.Position, to: CodeMirror.Position): Promise<CodeMirror.TextMarker[]> => {
			return _editor.findMarks(from, to);
		},

		findMarksAt: async (pos: CodeMirror.Position): Promise<CodeMirror.TextMarker[]> => {
			return _editor.findMarksAt(pos);
		},

		firstLine: async (): Promise<number> => {
			return _editor.firstLine();
		},

		getAllMarks: async (): Promise<CodeMirror.TextMarker[]> => {
			return _editor.getAllMarks();
		},

		getCursor: async (start?: string): Promise<CodeMirror.Position> => {
			return _editor.getCursor(start);
		},

		getEditor: async (): Promise<CodeMirror.Editor | null> => {
			return _editor.getEditor();
		},

		getHistory: async (): Promise<any> => {
			return _editor.getHistory();
		},

		getLine: async (n: number): Promise<string> => {
			return _editor.getLine(n);
		},

		getLineHandle: async (num: number): Promise<CodeMirror.LineHandle> => {
			return _editor.getLineHandle(num);
		},

		getLineNumber: async (handle: CodeMirror.LineHandle): Promise<number | null> => {
			return _editor.getLineNumber(handle);
		},

		getMode: async (): Promise<any> => {
			return _editor.getMode();
		},

		getRange: async (from: CodeMirror.Position, to: CodeMirror.Position, seperator?: string): Promise<string> => {
			return _editor.getRange(from, to, seperator);
		},

		getSelection: async (): Promise<string> => {
			return _editor.getSelection();
		},

		getSelections: async (lineSep?: string): Promise<Array<string>> => {
			return _editor.getSelections(lineSep);
		},

		getValue: async (separator?: string): Promise<string> => {
			return _editor.getValue(separator);
		},

		historySize: async (): Promise<{ undo: number; redo: number }> => {
			return _editor.historySize();
		},

		indexFromPos: async (object: CodeMirror.Position): Promise<number> => {
			return _editor.indexFromPos(object);
		},

		isClean: async (generation?: number): Promise<boolean> => {
			return _editor.isClean(generation);
		},

		iterLinkedDocs: async (fn: (doc: CodeMirror.Doc, sharedHist: boolean) => void): Promise<void> => {
			_editor.iterLinkedDocs(fn);
		},

		lastLine: async (): Promise<number> => {
			return _editor.lastLine();
		},

		lineCount: async (): Promise<number> => {
			return _editor.lineCount();
		},

		lineSeparator: async() : Promise<string> => {
			return _editor.lineSeparator();
		},

		linkedDoc: async (options: { sharedHist?: boolean; from?: number; to?: number; mode: any }): Promise<CodeMirror.Doc> => {
			return _editor.linkedDoc(options);
		},

		listSelections: async() : Promise<CodeMirror.Range[]> => {
			return _editor.listSelections();
		},

		markClean: async() : Promise<void> => {
			return _editor.markClean();
		},

		markText: async (from: CodeMirror.Position, to: CodeMirror.Position, options?: CodeMirror.TextMarkerOptions): Promise<CodeMirror.TextMarker> => {
			return _editor.markText(from, to, options);
		},

		posFromIndex: async (index: number): Promise<CodeMirror.Position> => {
			return _editor.posFromIndex(index);
		},

		redo: async() : Promise<void> => {
			_editor.redo();
		},

		removeLine: async (n: number): Promise<void> => {
			_editor.removeLine(n);
		},

		removeLineWidget: async (widget: CodeMirror.LineWidget): Promise<void> => {
			_editor.removeLineWidget(widget);
		},

		replaceRange: async (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position, origin?: string): Promise<void> => {
			_editor.replaceRange(replacement, from, to, origin);
		},

		replaceSelection: async (replacement: string, collapse?: string): Promise<void> => {
			_editor.replaceSelection(replacement, collapse);
		},

		replaceSelections: async (replacements: Array<string>, collapse?: string): Promise<void> => {
			_editor.replaceSelections(replacements, collapse);
		},

		setBookmark: async (pos: CodeMirror.Position, options?: { widget?: HTMLElement; insertLeft?: boolean; shared?: boolean; handleMouseEvents?: boolean }): Promise<CodeMirror.TextMarker> => {
			return _editor.setBookmark(pos, options);
		},

		setCursor: async (pos: CodeMirror.Position | number, ch?: number, options?: { bias?: number; origin?: string; scroll?: boolean }): Promise<void> => {
			_editor.setCursor(pos, ch, options);
		},

		setExtending: async (value: boolean): Promise<void> => {
			_editor.setExtending(value);
		},

		setHistory: async (history: any): Promise<void> => {
			_editor.setHistory(history);
		},

		setLine: async (n: number, text: string): Promise<void> => {
			_editor.setLine(n, text);
		},

		setSelection: async (anchor: CodeMirror.Position, head?: CodeMirror.Position, options?: { bias?: number; origin?: string; scroll?: boolean }): Promise<void> => {
			_editor.setSelection(anchor, head, options);
		},

		setSelections: async (ranges: Array<{ anchor: CodeMirror.Position; head: CodeMirror.Position }>, primary?: number, options?: { bias?: number; origin?: string; scroll?: boolean }): Promise<void> => {
			_editor.setSelections(ranges, primary, options);
		},

		setValue: async (content: string): Promise<void> => {
			_editor.setValue(content);
		},

		somethingSelected: async (): Promise<boolean> => {
			return _editor.somethingSelected();
		},

		undo: async (): Promise<void> => {
			_editor.undo();
		},

		unlinkDoc: async (doc: CodeMirror.Doc): Promise<void> => {
			_editor.unlinkDoc(doc);
		},
	}
}