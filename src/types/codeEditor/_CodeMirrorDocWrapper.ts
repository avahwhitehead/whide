import CodeMirror from "codemirror";
import { CodeMirrorDocWrapper } from "@whide/whide-types/";

/**
 * Wrap a {@link CodeMirror.Doc} object in an asynchronous wrapper
 * @param _doc	The object to wrap
 */
export function _wrapCodeMirrorDoc(_doc: CodeMirror.Doc) : CodeMirrorDocWrapper {
	return {
		modeOption: _doc.modeOption,
		state: _doc.state,

		addLineWidget: async (line: number|CodeMirror.LineHandle, node: HTMLElement, options?: CodeMirror.LineWidgetOptions): Promise<CodeMirror.LineWidget> => {
			return _doc.addLineWidget(line, node, options);
		},

		changeGeneration: async (closeEvent?: boolean): Promise<number> => {
			return _doc.changeGeneration(closeEvent);
		},

		clearHistory: async (): Promise<void> => {
			_doc.clearHistory();
		},

		copy: async (copyHistory: boolean): Promise<CodeMirrorDocWrapper> => {
			return _wrapCodeMirrorDoc(_doc.copy(copyHistory));
		},

		eachLine: async (f: ((line: CodeMirror.LineHandle) => void) | number, end?: number, f1?: (line: CodeMirror.LineHandle) => void): Promise<void> => {
			if (typeof f !== "number") _doc.eachLine(f);
			else _doc.eachLine(f, end!, f1!);
		},

		extendSelection: async (from: CodeMirror.Position, to?: CodeMirror.Position): Promise<void> => {
			_doc.extendSelection(from, to);
		},

		findMarks: async (from: CodeMirror.Position, to: CodeMirror.Position): Promise<CodeMirror.TextMarker[]> => {
			return _doc.findMarks(from, to);
		},

		findMarksAt: async (pos: CodeMirror.Position): Promise<CodeMirror.TextMarker[]> => {
			return _doc.findMarksAt(pos);
		},

		firstLine: async (): Promise<number> => {
			return _doc.firstLine();
		},

		getAllMarks: async (): Promise<CodeMirror.TextMarker[]> => {
			return _doc.getAllMarks();
		},

		getCursor: async (start?: string): Promise<CodeMirror.Position> => {
			return _doc.getCursor(start);
		},

		getEditor: async (): Promise<CodeMirror.Editor | null> => {
			return _doc.getEditor();
		},

		getHistory: async (): Promise<any> => {
			return _doc.getHistory();
		},

		getLine: async (n: number): Promise<string> => {
			return _doc.getLine(n);
		},

		getLineHandle: async (num: number): Promise<CodeMirror.LineHandle> => {
			return _doc.getLineHandle(num);
		},

		getLineNumber: async (handle: CodeMirror.LineHandle): Promise<number | null> => {
			return _doc.getLineNumber(handle);
		},

		getMode: async (): Promise<any> => {
			return _doc.getMode();
		},

		getRange: async (from: CodeMirror.Position, to: CodeMirror.Position, seperator?: string): Promise<string> => {
			return _doc.getRange(from, to, seperator);
		},

		getSelection: async (): Promise<string> => {
			return _doc.getSelection();
		},

		getSelections: async (lineSep?: string): Promise<Array<string>> => {
			return _doc.getSelections(lineSep);
		},

		getValue: async (separator?: string): Promise<string> => {
			return _doc.getValue(separator);
		},

		historySize: async (): Promise<{ undo: number; redo: number }> => {
			return _doc.historySize();
		},

		indexFromPos: async (object: CodeMirror.Position): Promise<number> => {
			return _doc.indexFromPos(object);
		},

		isClean: async (generation?: number): Promise<boolean> => {
			return _doc.isClean(generation);
		},

		iterLinkedDocs: async (fn: (doc: CodeMirrorDocWrapper, sharedHist: boolean) => void): Promise<void> => {
			_doc.iterLinkedDocs((doc, sharedHist) => fn(_wrapCodeMirrorDoc(doc), sharedHist));
		},

		lastLine: async (): Promise<number> => {
			return _doc.lastLine();
		},

		lineCount: async (): Promise<number> => {
			return _doc.lineCount();
		},

		lineSeparator: async() : Promise<string> => {
			return _doc.lineSeparator();
		},

		linkedDoc: async (options: { sharedHist?: boolean; from?: number; to?: number; mode: any }): Promise<CodeMirrorDocWrapper> => {
			return _wrapCodeMirrorDoc(_doc.linkedDoc(options));
		},

		listSelections: async() : Promise<CodeMirror.Range[]> => {
			return _doc.listSelections();
		},

		markClean: async() : Promise<void> => {
			return _doc.markClean();
		},

		markText: async (from: CodeMirror.Position, to: CodeMirror.Position, options?: CodeMirror.TextMarkerOptions): Promise<CodeMirror.TextMarker> => {
			return _doc.markText(from, to, options);
		},

		posFromIndex: async (index: number): Promise<CodeMirror.Position> => {
			return _doc.posFromIndex(index);
		},

		redo: async() : Promise<void> => {
			_doc.redo();
		},

		removeLine: async (n: number): Promise<void> => {
			_doc.removeLine(n);
		},

		removeLineWidget: async (widget: CodeMirror.LineWidget): Promise<void> => {
			_doc.removeLineWidget(widget);
		},

		replaceRange: async (replacement: string | string[], from: CodeMirror.Position, to?: CodeMirror.Position, origin?: string): Promise<void> => {
			_doc.replaceRange(replacement, from, to, origin);
		},

		replaceSelection: async (replacement: string, collapse?: string): Promise<void> => {
			_doc.replaceSelection(replacement, collapse);
		},

		replaceSelections: async (replacements: Array<string>, collapse?: string): Promise<void> => {
			_doc.replaceSelections(replacements, collapse);
		},

		setBookmark: async (pos: CodeMirror.Position, options?: { widget?: HTMLElement; insertLeft?: boolean; shared?: boolean; handleMouseEvents?: boolean }): Promise<CodeMirror.TextMarker> => {
			return _doc.setBookmark(pos, options);
		},

		setCursor: async (pos: CodeMirror.Position | number, ch?: number, options?: { bias?: number; origin?: string; scroll?: boolean }): Promise<void> => {
			_doc.setCursor(pos, ch, options);
		},

		setExtending: async (value: boolean): Promise<void> => {
			_doc.setExtending(value);
		},

		setHistory: async (history: any): Promise<void> => {
			_doc.setHistory(history);
		},

		setLine: async (n: number, text: string): Promise<void> => {
			_doc.setLine(n, text);
		},

		setSelection: async (anchor: CodeMirror.Position, head?: CodeMirror.Position, options?: { bias?: number; origin?: string; scroll?: boolean }): Promise<void> => {
			_doc.setSelection(anchor, head, options);
		},

		setSelections: async (ranges: Array<{ anchor: CodeMirror.Position; head: CodeMirror.Position }>, primary?: number, options?: { bias?: number; origin?: string; scroll?: boolean }): Promise<void> => {
			_doc.setSelections(ranges, primary, options);
		},

		setValue: async (content: string): Promise<void> => {
			_doc.setValue(content);
		},

		somethingSelected: async (): Promise<boolean> => {
			return _doc.somethingSelected();
		},

		undo: async (): Promise<void> => {
			_doc.undo();
		},

		unlinkDoc: async (doc: CodeMirrorDocWrapper): Promise<void> => {
			// @ts-ignore
			_doc.unlinkDoc(doc);
		},
	};
}