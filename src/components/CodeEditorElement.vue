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

		<InputPrompt @controller="ioControllerChange"/>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import EditorWidget from "./_internal/codeEditor/EditorWidget.vue";
import BreakpointWidget from "./_internal/codeEditor/BreakpointWidget.vue";
import { EditorController as EditorControllerInterface, IOController, } from "@/types";
import { EventEmitter } from "events";
import Sortable, { SortableEvent } from 'sortablejs';
//File imports
import { fs } from "@/files/fs";
import path from "path";
import { ENCODING_UTF8 } from "memfs/lib/encoding";
//The code editor
import CodeMirror, { Annotation, LineWidget, LintStateOptions, } from "codemirror";
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
import InputPrompt from "@/components/InputPrompt.vue";

const DARK_THEME = 'ayu-mirage';
const LIGHT_THEME = 'default';

interface DataType {
	editor: CodeMirror.Editor|undefined;
	editorController: EditorControllerInterface|undefined;
	ioController: IOController|undefined;
	openFiles: TabInfo[];
	errors: LineWidgetType[];
	infos: LineWidgetType[];
	warnings: LineWidgetType[];
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
	private breakpoints: CodeMirror.LineHandle[] = [];

	protected constructor() {
		super();
	}

	abstract get editor() : CodeMirror.Editor;
	abstract get focusedFile() : string|undefined;
	abstract get openFiles() : string[];

	abstract open(filePath: string) : Promise<void>;
	abstract close(filePath: string) : Promise<void>;
	abstract saveFiles() : Promise<void>;

	toggleBreakpoint(line: number|CodeMirror.LineHandle, enabled?: boolean) : void {
		//Line info
		const lineHandle: CodeMirror.LineHandle = asLineHandle(this.editor, line);
		let info = this.editor.lineInfo(line);

		//Not a valid line
		if (!info) return;

		//Toggle the breakpoint if a state wasn't specified
		if (enabled === undefined) enabled = !info.gutterMarkers;

		let marker : HTMLElement|null = null;
		if (enabled) {
			//Make a new breakpoint marker
			const node: Vue = new BreakpointWidget();
			node.$mount();
			//Use the breakpoint widget as the gutter marker
			marker = node.$el as HTMLElement;
			//Push the line to the list
			this.breakpoints.push(lineHandle);
		} else {
			//Remove the line from the list of breakpoints
			const index = this.breakpoints.indexOf(lineHandle);
			if (index >= 0) this.breakpoints.splice(index, 1);
		}
		//Add/remove the marker to/from the gutter
		this.editor.setGutterMarker(line, "breakpoints", marker);
	}

	getBreakpoints(): number[] {
		let r : number[] = [];
		for (let handle of this.breakpoints) {
			//Convert the line handle to a number
			const n : number|null = this.editor.getLineNumber(handle);
			//If the line handle is valid, convert it to 1-index and add it to the result list
			if (n !== null) r.push(n + 1);
		}
		return r;
	}
}

interface TabInfo {
	path: string;
	name: string;
	modified: boolean;
	doc: CodeMirror.Doc;
}


export default Vue.extend({
	name: 'CodeEditorContainer',
	components: {
		InputPrompt,
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
			ioController: undefined,
			openFiles: [],
			errors: [],
			infos: [],
			warnings: [],
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
		//Wrap the editor in an asynchronous wrapper
		this.editor = codeMirror;

		//Toggle breakpoints when the gutter is clicked
		this.editor.on("gutterClick", async (_:any, line: number|CodeMirror.LineHandle) => {
			if (!this.editor) throw new Error("Couldn't get editor");
			this.toggleBreakpoint(line)
		});

		//Create the editor controller object
		const that = this;
		this.editorController = new (class extends EditorController {
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
				let file: TabInfo|undefined = that.openFiles.find(f => f.path === filePath);
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
			const movedItem: TabInfo = this.openFiles.splice(event.oldIndex! - 1, 1)[0];
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

		/**
		 * Handle the IO controller updating
		 */
		ioControllerChange(controller: IOController) {
			this.ioController = controller;
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
		toggleBreakpoint(line: number|CodeMirror.LineHandle, enabled?: boolean) : void {
			this.editorController!.toggleBreakpoint(line, enabled);
		},
		getBreakpoints(): number[] {
			return this.editorController!.getBreakpoints();
		},

		triggerLint(): void {
			//Toggle linter off and on again to force an update with the new setting
			this.editor!.setOption("lint", false);
			this.editor!.setOption("lint", this.lintOptions);
		},

		async _openFile(filepath: string): Promise<TabInfo> {
			//Check to see if the file already exists as a tab
			let fileTabIndex: number = this.openFiles.findIndex(f => f.path === filepath);

			if (fileTabIndex > -1) {
				//Switch to the existing tab
				this.currentTab = fileTabIndex;
				return this.openFiles[fileTabIndex];
			}

			//Load the file content from the file into an CodeMirror Doc
			let content: string = await this._readFile(filepath);
			let doc: CodeMirror.Doc = CodeMirror.Doc(content, WHILE);

			//Open the file in the editor
			let tabInfo: TabInfo = {
				path: filepath,
				name: path.basename(filepath),
				doc: doc,
				modified: false
			};
			//Open the file in a new tab and switch to it
			this.currentTab = this.openFiles.push(tabInfo) - 1;

			return tabInfo;
		},
		async _readFile(filepath: string): Promise<string> {
			return await fs.promises.readFile(filepath, { encoding: ENCODING_UTF8 });
		},

		async _closeTab(tab: TabInfo): Promise<void> {
			//Only save if the file has unsaved changes
			if (!tab.doc.isClean()) {
				//TODO: Prompt for file save using v-dialog
				if (!this.ioController) {
					console.error("Couldn't get IO controller");
					return;
				}

				let res: string = await this.ioController.prompt({
					title: 'Unsaved changes',
					message: 'Do you want to save the file before closing?',
					options: ['Cancel', `Don't Save`, 'Save'],
				});

				//Stop here if the user presses cancel
				if (res === 'Cancel') return;
				//Save the file
				if (res === 'Save') await this._saveFile(tab);
			}

			//Close the tab
			this.openFiles.splice(this.openFiles.indexOf(tab), 1);
		},
		async _saveFile(tab: TabInfo): Promise<void> {
			//Write the file to persistent storage
			await this._writeFile(tab.path, tab.doc.getValue());
			//Mark the file as saved in the editor
			tab.doc.markClean();
		},
		async _writeFile(filepath: string, content: string): Promise<void> {
			await fs.promises.writeFile(filepath, content, { encoding: ENCODING_UTF8 });
		},
	},
	watch: {
		editor(new_val) {
			this.$emit("editorChange", new_val);
		},
		async currentTab(tab: number): Promise<void> {
			if (!this.editor) throw new Error("Couldn't get code editor");

			if (tab === -1) {
				//Prevent writing in the editor if there are no files open
				//TODO: Find a better way to handle the unnamed file
				this.editor.setOption('readOnly', true);
				this.editor.swapDoc(CodeMirror.Doc(''));
			} else {
				//Allow writing in the editor
				this.editor.setOption('readOnly', false);

				//Load the new tab's content into the editor
				let tabInfo: TabInfo = this.openFiles[tab];
				this.editor.swapDoc(tabInfo.doc);

				this.triggerLint();
			}
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
}

.tabs {
	/*By default v-tabs grows with flex 1*/
	flex: 0;
}

.tab-close {
	margin-left: .5em;
}

.codeHolder {
	text-align: left;
	/*Fill the available space*/
	flex: 1;
	width: 100%;
}
</style>