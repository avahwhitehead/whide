<template>
	<div class="editorHolder">
		<v-tabs
			v-model="currentTab"
			ref="sortableTabs"
			class="tabs"
			:hide-slider="true"
		>
			<v-tab
				v-for="(tab,i) in openFiles" :key="i"
				@click.middle="_closeTab(tab)"
			>
				<span class="tab-name">{{ tab.name }}<span v-if="tab.modified">*</span></span>
				<FontAwesomeIcon icon="times" class="tab-close" @click="_closeTab(tab)" />
			</v-tab>
		</v-tabs>

		<div ref="codeHolder" class="codeHolder"></div>

		<v-dialog
			persistent
			v-model="showSaveDialog"
			width="400px"
		>
			<v-card>
				<v-card-text>Unsaved changes</v-card-text>
				<v-card-text>
					Do you want to save the file before closing?
				</v-card-text>
				<v-card-actions>
					<v-spacer />

					<v-btn
						color="blue darken-1"
						text
						@click="showSaveDialog = false"
						v-text="'Cancel'"
					/>

					<v-btn
						color="blue darken-1"
						text
						@click="saveDialogNoSaveClick()"
						v-text="`Don't Save`"
					/>

					<v-btn
						color="blue darken-1"
						text
						@click="saveDialogSaveClick()"
						v-text="'Save'"
					/>
				</v-card-actions>
			</v-card>
		</v-dialog>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import EditorWidget from "./_internal/codeEditor/EditorWidget.vue";
import BreakpointWidget from "./_internal/codeEditor/BreakpointWidget.vue";
import { EditorController as EditorControllerInterface, } from "@/types";
import { EventEmitter } from "events";
import Sortable, { SortableEvent } from 'sortablejs';
//File imports
import { fs } from "@/files/fs";
import path from "path";
import { ENCODING_UTF8 } from "memfs/lib/encoding";
//The code editor
import CodeMirror, { Annotation, LineHandle, LineWidget, LintStateOptions, } from "codemirror";
//CodeMirror addons
import 'codemirror/addon/lint/lint';
//CodeMirror styling
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ayu-mirage.css';
import 'codemirror/addon/lint/lint.css';
//While language syntax definition
import WHILE from "@/assets/whileSyntaxMode";
//WHILE linter
import { ErrorType, ErrorType as WhileError, linter as whileLinter } from "whilejs";

//Editor themes for light and dark mode
const DARK_THEME = 'ayu-mirage';
const LIGHT_THEME = 'default';

interface DataType {
	editor: CodeMirror.Editor|undefined;
	editorController: EditorControllerInterface|undefined;
	openFiles: FileInfoState[];
	errors: LineWidgetType[];
	infos: LineWidgetType[];
	warnings: LineWidgetType[];
	showSaveDialog: boolean;
	closingTab: FileInfoState|undefined;
}

function addWidget(editor: CodeMirror.Editor, line: number|CodeMirror.LineHandle, element: HTMLElement) : CodeMirror.LineWidget {
	return editor.addLineWidget(line, element, {
		above: true,
		coverGutter: true,
		noHScroll: true,
		handleMouseEvents: true,
	});
}

function asLineHandle(editor: CodeMirror.Editor, line: number|CodeMirror.LineHandle) : CodeMirror.LineHandle {
	if (typeof(line) === "number") return editor.getLineHandle(line);
	return line;
}
export type LineWidgetType = { line: CodeMirror.LineHandle, widget: CodeMirror.LineWidget };

function makeWidget(editor : CodeMirror.Editor, line: number|CodeMirror.LineHandle, type: string, arr: LineWidgetType[]) : LineWidget {
	//Make a new widget element
	const node: Vue = new EditorWidget({
		propsData: { type: type }
	});
	node.$mount();
	//Show the widget on the editor
	const lineWidget = addWidget(editor, line, node.$el as HTMLElement);
	//Save the line to the list
	arr.push({
		line: asLineHandle(editor, line),
		widget: lineWidget,
	});
	return lineWidget;
}

/**
 * Partially implemented EditorController object to allow controlling the editor from within plugins
 */
abstract class EditorController extends EventEmitter implements EditorControllerInterface {
	protected constructor() {
		super();
	}

	abstract get editor() : CodeMirror.Editor;
	abstract get focusedFile() : string|undefined;
	abstract get openFiles() : string[];

	abstract open(filePath: string) : Promise<void>;
	abstract close(filePath: string) : Promise<void>;
	abstract saveFiles() : Promise<void>;

	abstract toggleBreakpoint(line: number|CodeMirror.LineHandle, enabled?: boolean) : void;

	abstract getBreakpoints(): number[];
}

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
	 * Options to use to create the CodeMirror document.
	 * Also a {@code text} option to set the initial doc content
	 */
	docOptions: CustomMirrorDocOptions & { text?: string };
}>;

/**
 * Information about a file opened in an editor tab.
 */
export class FileInfoState {
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
	 * @param name      Name of the file
	 * @param path      Path to the file
	 * @param options   (Optional) configuration objects for the file
	 */
	constructor(name: string, path: string, options?: FileInfoStateOptions) {
		options = options || {};

		this._name = name;
		this._path = path;
		this._modified = (options.modified !== undefined) ? options.modified : false;

		//Create a new CodeMirror Doc
		this._doc = new CustomMirrorDoc(options.docOptions?.text || '', this, options.docOptions);
	}

	get name(): string {
		return this._name;
	}
	set name(value: string) {
		this._name = value;
	}
	get modified(): boolean {
		return this._modified;
	}
	set modified(value: boolean) {
		this._modified = value;
	}
	get doc(): CustomMirrorDoc {
		return this._doc;
	}
	set doc(value: CustomMirrorDoc) {
		this._doc = value;
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
	}
}

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
	 */
	toggleBreakpoint(line: number|CodeMirror.LineHandle, enabled?: boolean) : void {
		if (typeof line === 'number') {
			//Get a line handle from the line number
			line = this.getLineHandle(line);
		} else {
			//Check the line handle is for this doc
			let info = this.getLineNumber(line);
			if (!info) return;
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

export default Vue.extend({
	name: 'CodeEditorContainer',
	components: {

	},
	props: {
		value: {
			type: String,
			required: false,
		},
		allowExtended: {
			type: Boolean,
			default: false,
		}
	},
	data() : DataType {
		return {
			//The code editor object - undefined until the object is created in `mounted`
			editor: undefined,
			editorController: undefined,
			openFiles: [],
			errors: [],
			infos: [],
			warnings: [],
			showSaveDialog: false,
			closingTab: undefined,
		}
	},
	mounted() {
		//HTML element containing the tab elements
		let tabsHolder = (this.$refs.sortableTabs! as Vue).$el.getElementsByClassName('v-slide-group__content')[0];
		//Allow dragging to reorder the tabs
		new Sortable(
			tabsHolder as HTMLElement,
			{onEnd: this.onTabDragEnd}
		);

		//Create the code editor in the div
		let codeMirror : CodeMirror.Editor = CodeMirror(this.$refs.codeHolder as HTMLElement, {
			lineNumbers: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-lint-markers", "breakpoints"],
			tabSize: 4,
			value: "",
			mode: WHILE,
			lint: this.lintOptions,
			theme: this.isDarkTheme ? DARK_THEME : LIGHT_THEME
		});
		codeMirror.setSize("100%", "100%");
		if (this.currentTab === -1) {
			codeMirror.setOption('readOnly', true);
		}

		//Wrap the editor in an asynchronous wrapper
		this.editor = codeMirror;

		//Toggle breakpoints when the gutter is clicked
		this.editor.on("gutterClick", async (editor: CodeMirror.Editor, line: number|CodeMirror.LineHandle) => {
			// this.toggleBreakpoint(line)
			let doc = editor.getDoc() as CustomMirrorDoc;
			doc.toggleBreakpoint(line);
		});

		//Mark the current tab as unsaved when the content is changed
		let pending: NodeJS.Timeout|undefined;
		codeMirror.on("change", () => {
			this.currentFileState!.modified = true;
			if (pending) clearTimeout(pending);
			pending = setTimeout(() => {
				if (!this.editorController) return;
				this.editorController.saveFiles();
			}, 5000);
		});

		//Create the editor controller object
		const that = this;
		this.editorController = new (class extends EditorController {
			getBreakpoints(): number[] {
				return (this.editor.getDoc() as CustomMirrorDoc).breakpoints;
			}
			toggleBreakpoint(line: number|CodeMirror.LineHandle, enabled?: boolean): void {
				(this.editor.getDoc() as CustomMirrorDoc).toggleBreakpoint(line, enabled);
			}
			constructor() {
				super();
			}
			get editor(): CodeMirror.Editor {
				return codeMirror;
			}
			get focusedFile(): string|undefined {
				if (that.currentTab === undefined) return undefined;
				return that.openFiles[that.currentTab].path;
			}
			get openFiles() : string[] {
				return that.openFiles.map(t => t.path);
			}
			async close(filePath: string): Promise<void> {
				let file: FileInfoState|undefined = that.openFiles.find(f => f.path === filePath);
				if (!file) {
					console.error(`File "${filePath}" is not open`);
					return;
				}
				await that._closeTab(file);
			}
			async open(filePath: string): Promise<void> {
				await that._openFile(filePath);
			}
			async saveFiles(): Promise<void> {
				that.openFiles.forEach(t => {
					that._saveFile(t);
				})
			}
		})();

		//Autosave files every 20 seconds
		setInterval(() => {
			if (!this.editorController) return;
			this.editorController.saveFiles();
		}, AUTOSAVE_INTERVAL * 1000);
	},
	computed: {
		lintOptions(): LintStateOptions {
			return {
				async: false,
				delay: 0,
				getAnnotations: this.lintCode,
				hasGutters: true,
				lintOnChange: true,
			};
		},
		isDarkTheme(): boolean {
			return this.$vuetify.theme.dark;
		},

		currentTab: {
			get(): number {
				if (this.value !== undefined) {
					return this.openFiles.findIndex(f => f.path === this.value);
				}
				return -1;
			},
			set(val: number): void {
				this.$emit('input', val === -1 ? undefined : this.openFiles[val].path);
			},
		},
	},
	methods: {
		onTabDragEnd(event: SortableEvent): any {
			const movedItem: FileInfoState = this.openFiles.splice(event.oldIndex! - 1, 1)[0];
			this.openFiles.splice(event.newIndex!, 0, movedItem);
		},

		lintCode(content: string): Annotation[]|Promise<Annotation[]> {
			if (!content) return [];

			//Run the linter on the code
			let errors: ErrorType[] = whileLinter(content, { pureOnly: !this.allowExtended });

			//Convert the linter's error type to the CodeMirror type
			return errors.map((err: WhileError): Annotation => {
				let res: Annotation = {
					from: {
						ch: err.position.col,
						line: err.position.row,
					},
					message: err.message,
					severity: 'error',
				};
				if (err.endPos) {
					res.to = {
						ch: err.endPos.col,
						line: err.endPos.row,
					}
				}
				return res;
			});
		},

		addError(line: number|CodeMirror.LineHandle): CodeMirror.LineWidget {
			return makeWidget(this.editor!, line, 'error', this.errors)
		},
		addInfo(line: number|CodeMirror.LineHandle): CodeMirror.LineWidget {
			return makeWidget(this.editor!, line, 'info', this.infos)
		},
		addWarning(line: number|CodeMirror.LineHandle): CodeMirror.LineWidget {
			return makeWidget(this.editor!, line, 'warning', this.warnings)
		},
		removeError(widget: CodeMirror.LineWidget): void {
			this.editor!.removeLineWidget(widget)
		},
		removeInfo(widget: CodeMirror.LineWidget): void {
			this.editor!.removeLineWidget(widget)
		},
		removeWarning(widget: CodeMirror.LineWidget): void {
			this.editor!.removeLineWidget(widget)
		},

		triggerLint(): void {
			//Toggle linter off and on again to force an update with the new setting
			this.editor!.setOption("lint", false);
			this.editor!.setOption("lint", this.lintOptions);
		},

		async _openFile(filepath: string): Promise<FileInfoState> {
			//Check to see if the file already exists as a tab
			let fileTabIndex: number = this.openFiles.findIndex(f => f.path === filepath);

			if (fileTabIndex > -1) {
				//Switch to the existing tab
				this.currentTab = fileTabIndex;
				return this.openFiles[fileTabIndex];
			}

			//Load the file content from the file into an CodeMirror Doc
			let content: string = await this._readFile(filepath);
			//Open the file in the editor
			let tabInfo: FileInfoState = new FileInfoState(
				path.basename(filepath),
				filepath,
				{
					docOptions: { text: content }
				}
			);
			//Open the file in a new tab and switch to it
			this.currentTab = this.openFiles.push(tabInfo) - 1;

			return tabInfo;
		},
		async _readFile(filepath: string): Promise<string> {
			return await fs.promises.readFile(filepath, { encoding: ENCODING_UTF8 });
		},

		async _closeTab(tab: FileInfoState): Promise<void> {
			//Only save if the file has unsaved changes
			if (!tab.doc.isClean()) {
				this.showSaveDialog = true;
				this.closingTab = tab;
			} else {
				//Close the tab
				this.openFiles.splice(this.openFiles.indexOf(tab), 1);
			}
		},
		async _saveFile(tab: FileInfoState): Promise<void> {
			//Write the file to persistent storage
			await this._writeFile(tab.path, tab.doc.getValue());
			//Mark the file as saved in the editor
			tab.doc.markClean();
			tab.modified = false;
		},
		async _writeFile(filepath: string, content: string): Promise<void> {
			await fs.promises.writeFile(filepath, content, { encoding: ENCODING_UTF8 });
		},

		async saveDialogSaveClick() {
			if (!this.closingTab) return;
			//Save the file
			await this._saveFile(this.closingTab)
			//Close the tab
			this.openFiles.splice(this.openFiles.indexOf(this.closingTab), 1);
			//Hide the popup
			this.showSaveDialog = false;
			this.closingTab = undefined;
		},
		saveDialogNoSaveClick() {
			if (!this.closingTab) return;
			//Close the tab
			this.openFiles.splice(this.openFiles.indexOf(this.closingTab), 1);
			//Hide the popup
			this.showSaveDialog = false;
			this.closingTab = undefined;
		},
	},
	watch: {
		editor(new_val) {
			this.$emit("editorChange", new_val);
		},
		async currentTab(tab: number): Promise<void> {
			if (!this.editor) throw new Error("Couldn't get code editor");

			let focusedFile: FileInfoState|undefined;
			if (tab === -1) {
				//Prevent writing in the editor if there are no files open
				//TODO: Find a better way to handle the unnamed file
				this.editor.swapDoc(CodeMirror.Doc(''));
				this.editor.setOption('readOnly', true);

				focusedFile = undefined;
			} else {
				focusedFile = this.openFiles[tab];

				//Allow writing in the editor
				this.editor.setOption('readOnly', false);

				//Load the new tab's content into the editor
				let tabInfo: FileInfoState = focusedFile;
				this.editor.swapDoc(tabInfo.doc);

				this.triggerLint();
			}
			//Update the focused file in the VueX store
			this.$store.commit('openFiles.setFocused', focusedFile);
		},
		/**
		 * Emit an event when the editor controller object changes
		 */
		editorController(newController) {
			this.$emit("controller", newController);
		},
		allowExtended() {
			this.triggerLint();
		},
		isDarkTheme(isDark: boolean) {
			if (this.editor) {
				this.editor.setOption("theme", isDark ? DARK_THEME : LIGHT_THEME);
			}
		},
		openFiles(openFiles: FileInfoState[]) {
			this.$store.commit('openFiles.set', openFiles);
		}
	}
});
</script>

<!--suppress CssUnusedSymbol -->
<style>
/*Add gutter space for the breakpoint icons*/
.codeHolder .breakpoints {
	width: .8em;
}

.CodeMirror {
	height: 100%;
	flex: 1;
}
</style>

<style scoped>
.editorHolder {
	/*Allow the code editor to fill the space without overflowing*/
	display: flex;
	flex-direction: column;
	/*Fill the available width*/
	width: 100%;
	/*Don't scroll with the tabs*/
	overflow-y: hidden;
}

.tabs {
	/*By default v-tabs grows with flex 1*/
	flex: 0;
}

.tab-close {
	margin-left: .5em;
}

.tab-name {
	text-transform: none !important;
}

.codeHolder {
	text-align: left;
	/*Fill the available space*/
	flex: 1;
	width: 100%;
	/*Scroll the editor*/
	overflow-y: auto;
}
</style>