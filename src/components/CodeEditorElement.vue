<template>
	<div class="editorHolder">
		<draggable
			v-model="openFiles"
			style="display: flex"
			@end="onDragEnd"
		>
			<v-card
				class="pa-0"
				elevation="0"
				v-for="(tab,i) in openFiles" :key="i"
				@click.middle="_closeTab(tab)"
				@click.left="currentTab = i"
			>
				<v-card-text
					:class="{'primary--text': currentTab === i}"
				>
					<span class="tab-name">{{ tab.name }}</span>
					<span v-if="tab.modified">*</span>
					<FontAwesomeIcon icon="times" class="tab-close" @click="_closeTab(tab)" />
				</v-card-text>
			</v-card>
		</draggable>

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
import { EditorController as EditorControllerInterface, } from "@/types";
import { FileInfoState } from "@/types/FileInfoState";
import { CustomMirrorDoc } from "@/types/CustomMirrorDoc";
import { EventEmitter } from "events";
import VueDraggable from "vuedraggable";
// eslint-disable-next-line @typescript-eslint/no-unused-vars
import { SortableEvent } from 'sortablejs';
//File imports
import { fs } from "@/files/fs";
import path from "path";
import { ENCODING_UTF8 } from "memfs/lib/encoding";
//The code editor
import CodeMirror, { Annotation, LineWidget, LintStateOptions } from "codemirror";
//CodeMirror addons
import 'codemirror/addon/lint/lint';
//CodeMirror styling
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ayu-mirage.css';
import 'codemirror/addon/lint/lint.css';
//While language syntax definition
import { PURE_WHILE, WHILE } from "@/assets/whileSyntaxMode";
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

export default Vue.extend({
	name: 'CodeEditorContainer',
	components: {
		draggable: VueDraggable
	},
	props: {
		value: {
			type: String,
			required: false,
		},
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
		this.openFiles = [...this.$store.state.openFiles];

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

		if (this.currentFileState === undefined) {
			codeMirror.setOption('readOnly', true);
		} else {
			codeMirror.swapDoc(this.currentFileState.doc);
		}

		this.editor = codeMirror;

		//Toggle breakpoints when the gutter is clicked
		this.editor.on("gutterClick", async (editor: CodeMirror.Editor, line: number|CodeMirror.LineHandle) => {
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
				if (that.currentFileState === undefined) return undefined;
				return that.currentFileState.path;
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
	},
	beforeDestroy() {
		// Close the current document in the editor before destroying this element
		// so the same document can be opened if/when the element is recreated
		(this.editor as CodeMirror.Editor).swapDoc(new CodeMirror.Doc(''));
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
		//Wrapper around the VueX focusedFile value
		currentTab: {
			get(): number {
				return this.$store.state.focusedFile;
			},
			set(val: number): void {
				// Only done by v-tabs model
				// noinspection JSIncompatibleTypesComparison
				if (val === undefined) val = -1;

				//Update the focused file in the VueX store
				this.$store.commit('openFiles.setFocused', val);
			},
		},
		currentFileState: {
			get(): FileInfoState|undefined {
				if (this.currentTab === -1) return undefined;
				return this.openFiles[this.currentTab];
			},
		},
		allowExtended(): boolean {
			if (this.currentFileState === undefined) return true;
			return this.currentFileState.extWhile;
		},
	},
	methods: {
		onDragEnd(event: SortableEvent): any {
			//If the focused tab was being dragged, update the index
			if (event.oldIndex === this.currentTab) {
				this.currentTab = event.newIndex!;
			}
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
				const index = this.openFiles.indexOf(tab);
				this.openFiles.splice(index, 1);
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
		currentFileState(currentFileState: FileInfoState|undefined) {
			if (!this.editor) throw new Error("Couldn't get code editor");

			if (currentFileState === undefined) {
				//Prevent writing in the editor if there are no files open
				//TODO: Find a better way to handle the unnamed file
				this.editor.swapDoc(CodeMirror.Doc(''));
				this.editor.setOption('readOnly', true);
			} else {
				//Load the new tab's content into the editor
				this.editor.swapDoc(currentFileState.doc);
				this.editor.setOption('readOnly', false);
				//Trigger a lint of the new content
				this.triggerLint();
			}
		},
		/**
		 * Emit an event when the editor controller object changes
		 */
		editorController(newController) {
			this.$emit("controller", newController);
		},
		allowExtended(allowExtended: boolean) {
			if (this.editor) {
				this.editor!.setOption('mode', allowExtended ? WHILE : PURE_WHILE);
				this.triggerLint();
			}
		},
		isDarkTheme(isDark: boolean) {
			if (this.editor) {
				this.editor.setOption("theme", isDark ? DARK_THEME : LIGHT_THEME);
			}
		},
		openFiles(openFiles: FileInfoState[]) {
			//Update the open files list in the VueX store
			this.$store.commit('openFiles.set', openFiles);
			//Focus on the last tab in the list if the list is shortened past the focused tab
			if (this.currentTab >= openFiles.length) {
				this.currentTab = openFiles.length - 1;
			}
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