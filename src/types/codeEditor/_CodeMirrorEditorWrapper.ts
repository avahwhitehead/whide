import CodeMirror from "codemirror";
import { CodeMirrorEditorWrapper } from "@whide/whide-types/";

/**
 * Wrap a {@link CodeMirror.Editor} object in an asynchronous wrapper
 * @param _editor	The object to wrap
 */
export function _wrapCodeMirrorEditor(_editor : CodeMirror.Editor) : CodeMirrorEditorWrapper {
	return {
		state: _editor.state,

		async addKeyMap(map: string | CodeMirror.KeyMap, bottom?: boolean): Promise<void> {
			_editor.addKeyMap(map, bottom);
		},
		async addLineClass(line: any, where: string, _class_: string): Promise<CodeMirror.LineHandle> {
			return _editor.addLineClass(line, where, _class_);
		},
		async addLineWidget(line: any, node: HTMLElement, options?: CodeMirror.LineWidgetOptions): Promise<CodeMirror.LineWidget> {
			return _editor.addLineWidget(line, node, options);
		},
		async addOverlay(mode: any, options?: any): Promise<void> {
			return _editor.addOverlay(mode, options);
		},
		async addWidget(pos: CodeMirror.Position, node: HTMLElement, scrollIntoView: boolean): Promise<void> {
			return _editor.addWidget(pos, node, scrollIntoView);
		},
		async charCoords(pos: CodeMirror.Position, mode?: CodeMirror.CoordsMode): Promise<{ left: number; right: number; top: number; bottom: number }> {
			return _editor.charCoords(pos, mode);
		},
		async clearGutter(gutterID: string): Promise<void> {
			return _editor.clearGutter(gutterID);
		},
		async coordsChar(object: { left: number; top: number }, mode?: CodeMirror.CoordsMode): Promise<CodeMirror.Position> {
			return _editor.coordsChar(object, mode);
		},
		async cursorCoords(where?: boolean | CodeMirror.Position | null, mode?: CodeMirror.CoordsMode): Promise<{ left: number; top: number; bottom: number }> {
			if (typeof(where) === "boolean") {
				return _editor.cursorCoords(where, mode);
			}
			return _editor.cursorCoords(where, mode);
		},
		async defaultCharWidth(): Promise<number> {
			return _editor.defaultCharWidth();
		},
		async defaultTextHeight(): Promise<number> {
			return _editor.defaultTextHeight();
		},
		async endOperation(): Promise<void> {
			return _editor.endOperation();
		},
		async execCommand(name: string): Promise<void> {
			return _editor.execCommand(name);
		},
		async findPosH(start: CodeMirror.Position, amount: number, unit: string, visually: boolean): Promise<{ line: number; ch: number; hitSide?: boolean }> {
			return _editor.findPosH(start, amount, unit, visually);
		},
		async findPosV(start: CodeMirror.Position, amount: number, unit: string): Promise<{ line: number; ch: number; hitSide?: boolean }> {
			return _editor.findPosV(start, amount, unit);
		},
		async findWordAt(pos: CodeMirror.Position): Promise<CodeMirror.Range> {
			return _editor.findWordAt(pos);
		},
		async focus(): Promise<void> {
			return _editor.focus();
		},
		async getCursor(start?: string): Promise<CodeMirror.Position> {
			return _editor.getCursor(start);
		},
		async getDoc(): Promise<CodeMirror.Doc> {
			return _editor.getDoc();
		},
		async getGutterElement(): Promise<HTMLElement> {
			return _editor.getGutterElement();
		},
		async getInputField(): Promise<HTMLTextAreaElement> {
			return _editor.getInputField();
		},
		async getLineTokens(line: number, precise?: boolean): Promise<CodeMirror.Token[]> {
			return _editor.getLineTokens(line, precise);
		},
		async getModeAt(pos: CodeMirror.Position): Promise<any> {
			return _editor.getModeAt(pos);
		},
		async getOption<K extends keyof CodeMirror.EditorConfiguration>(option: K): Promise<CodeMirror.EditorConfiguration[K]> {
			return _editor.getOption(option);
		},
		async getScrollInfo(): Promise<CodeMirror.ScrollInfo> {
			return _editor.getScrollInfo();
		},
		async getScrollerElement(): Promise<HTMLElement> {
			return _editor.getScrollerElement();
		},
		async getStateAfter(line?: number): Promise<any> {
			return _editor.getStateAfter(line);
		},
		async getTokenAt(pos: CodeMirror.Position, precise?: boolean): Promise<CodeMirror.Token> {
			return _editor.getTokenAt(pos, precise);
		},
		async getTokenTypeAt(pos: CodeMirror.Position): Promise<string> {
			return _editor.getTokenTypeAt(pos);
		},
		async getValue(seperator?: string): Promise<string> {
			return _editor.getValue(seperator);
		},
		async getViewport(): Promise<{ from: number; to: number }> {
			return _editor.getViewport();
		},
		async getWrapperElement(): Promise<HTMLElement> {
			return _editor.getWrapperElement();
		},
		async heightAtLine(line: any, mode?: CodeMirror.CoordsMode, includeWidgets?: boolean): Promise<number> {
			return _editor.heightAtLine(line, mode, includeWidgets);
		},
		async indentLine(line: number, dir?: string): Promise<void> {
			return _editor.indentLine(line, dir);
		},
		async indentSelection(how: string): Promise<void> {
			return _editor.indentSelection(how);
		},
		async isReadOnly(): Promise<boolean> {
			return _editor.isReadOnly();
		},
		async lineAtHeight(height: number, mode?: CodeMirror.CoordsMode): Promise<number> {
			return _editor.lineAtHeight(height, mode);
		},
		async lineInfo(line: any): Promise<{ line: any; handle: any; text: string; gutterMarkers: any; textClass: string; bgClass: string; wrapClass: string; widgets: any }> {
			return _editor.lineInfo(line);
		},
		async off<K extends CodeMirror.DOMEvent>(eventName: string | K, handler: (instance: CodeMirror.Editor, ...args: any[]) => void,): Promise<void> {
			// if (typeof(eventName) === "string") return _editor.off(eventName as string, handler);
			// return _editor.off(eventName as K, handler);
			return _editor.off(eventName, handler);
		},
		async on<K extends CodeMirror.DOMEvent>(eventName: string | K, handler: (instance: CodeMirror.Editor, ...args: any[]) => void,): Promise<void> {
			return _editor.on(eventName, handler);
		},
		async operation<T>(fn: () => T): Promise<T> {
			return _editor.operation<T>(fn);
		},
		async refresh(): Promise<void> {
			return _editor.refresh();
		},
		async removeKeyMap(map: string | CodeMirror.KeyMap): Promise<void> {
			return _editor.removeKeyMap(map);
		},
		async removeLineClass(line: any, where: string, class_?: string): Promise<CodeMirror.LineHandle> {
			return _editor.removeLineClass(line, where, class_);
		},
		async removeOverlay(mode: any): Promise<void> {
			return _editor.removeOverlay(mode);
		},
		async scrollIntoView(pos: { line: number; ch: number } | { left: number; top: number; right: number; bottom: number } | CodeMirror.Position | null | { from: CodeMirror.Position; to: CodeMirror.Position }, margin?: number): Promise<void> {
			// @ts-ignore
			return _editor.scrollIntoView(pos, margin);
		},
		async scrollTo(x?: number | null, y?: number | null): Promise<void> {
			return _editor.scrollTo(x, y);
		},
		async setCursor(pos: CodeMirror.Position | number, ch?: number, options?: { bias?: number; origin?: string; scroll?: boolean }): Promise<void> {
			return _editor.setCursor(pos, ch, options);
		},
		async setGutterMarker(line: any, gutterID: string, value: HTMLElement | null): Promise<CodeMirror.LineHandle> {
			return _editor.setGutterMarker(line, gutterID, value);
		},
		async setOption<K extends keyof CodeMirror.EditorConfiguration>(option: K, value: CodeMirror.EditorConfiguration[K]): Promise<void> {
			return _editor.setOption<K>(option, value);
		},
		async setSize(width: any, height: any): Promise<void> {
			return _editor.setSize(width, height);
		},
		async setValue(content: string): Promise<void> {
			return _editor.setValue(content);
		},
		async startOperation(): Promise<void> {
			return _editor.startOperation();
		},
		async swapDoc(doc: CodeMirror.Doc): Promise<CodeMirror.Doc> {
			return _editor.swapDoc(doc);
		},
		async toggleOverwrite(value?: boolean): Promise<void> {
			return _editor.toggleOverwrite(value);
		},
	};
}