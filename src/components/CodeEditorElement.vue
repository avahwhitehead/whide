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
				v-for="tab in openFileStates" :key="tab.id"
				@click.middle="_closeTab(tab)"
				@click.left="currentTabFile = tab.id"
			>
				<v-card-text
					:class="{'primary--text': currentFileState === tab}"
				>
					<span class="tab-name">{{ tab.name }}</span>
					<span v-if="tab.modified">*</span>
					<FontAwesomeIcon icon="times" class="tab-close" @click="_closeTab(tab)" />
				</v-card-text>
			</v-card>
		</draggable>

		<v-container class="pa-0 ma-0 editor-container">
			<v-row class="fill-height ma-0">
				<v-col :cols="showSecondEditor?6:12" class="fill-height pa-0 editor-col">
					<div ref="codeHolder" class="codeHolder fill-height" />
				</v-col>

				<v-divider vertical />

				<v-col :cols="6" class="fill-height pa-0 editor-col" :class="{'hidden': !showSecondEditor}">
					<div ref="codeHolder2" class="codeHolder fill-height" />

					<v-divider />

					<div class="pa-0 errorHolder" v-if="showErrorList">
						<div v-for="(e,i) in errorList" :key="i" class="errorLine">
							<v-icon class="errorIcon">fa-times-circle</v-icon>
							<span class="errorText">{{ e }}</span>
						</div>
					</div>
				</v-col>
			</v-row>
		</v-container>

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

		<SaveAsDialog v-model="showSaveAsDialog" @change="handleSaveAs" />
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import EditorWidget from "./_internal/codeEditor/EditorWidget.vue";
import { FileInfoState } from "@/types/FileInfoState";
import { CustomMirrorDoc } from "@/types/CustomMirrorDoc";
import SaveAsDialog from "@/components/SaveAsDialog.vue";
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
import 'codemirror/addon/hint/anyword-hint';
import 'codemirror/addon/hint/show-hint';
//CodeMirror styling
import 'codemirror/lib/codemirror.css';
import 'codemirror/theme/ayu-mirage.css';
import 'codemirror/addon/lint/lint.css';
import 'codemirror/addon/hint/show-hint.css';
//While language syntax definition
import { PURE_WHILE, WHILE } from "@/assets/whileSyntaxMode";
//WHILE linter
import { ErrorType, ErrorType as WhileError, linter as whileLinter } from "whilejs";
import { AbstractRunner } from "@/run/AbstractRunner";
import { SaveDialogReturnValue } from "electron";

const electron = (window['require'] !== undefined) ? require("electron") : undefined;

//Editor themes for light and dark mode
const DARK_THEME = 'ayu-mirage';
const LIGHT_THEME = 'default';

interface DataType {
	editor: CodeMirror.Editor|undefined;
	editor2: CodeMirror.Editor|undefined;
	openFiles: string[];
	errors: LineWidgetType[];
	infos: LineWidgetType[];
	warnings: LineWidgetType[];
	showSaveDialog: boolean;
	showSaveAsDialog: boolean;
	closingTab: FileInfoState|undefined;
	secondEditorContent: string|undefined;
	saveAsResolver: ((r: boolean) => void)|undefined;
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

export default Vue.extend({
	name: 'Codeeditor-container',
	components: {
		draggable: VueDraggable,
		SaveAsDialog,
	},
	props: {
		value: {
			type: String,
			required: false,
		},
	},
	data() : DataType {
		return {
			editor: undefined,
			editor2: undefined,
			openFiles: [],
			errors: [],
			infos: [],
			warnings: [],
			showSaveDialog: false,
			showSaveAsDialog: false,
			closingTab: undefined,
			secondEditorContent: undefined,
			saveAsResolver: undefined,
		}
	},
	mounted() {
		this.openFiles = this.stateOpenFiles;

		//Create the code editor in the div
		let codeMirror : CodeMirror.Editor = CodeMirror(this.$refs.codeHolder as HTMLElement, {
			lineNumbers: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-lint-markers", "breakpoints"],
			tabSize: 4,
			value: "",
			mode: WHILE,
			lint: this.lintOptions,
			theme: this.isDarkTheme ? DARK_THEME : LIGHT_THEME,
			extraKeys: {
				"Ctrl-Space": "autocomplete",
			},
		});
		codeMirror.setSize("100%", "100%");

		if (this.currentFileState !== undefined) {
			codeMirror.swapDoc(this.currentFileState.doc);
		}

		this.editor = codeMirror;

		//Toggle breakpoints when the gutter is clicked
		this.editor.on("gutterClick", async (editor: CodeMirror.Editor, line: number|CodeMirror.LineHandle) => {
			let doc = editor.getDoc() as CustomMirrorDoc;
			this.toggleBreakpoint(doc, line);
		});

		//Mark the current tab as unsaved when the content is changed
		let pending: NodeJS.Timeout|undefined;
		codeMirror.on("change", () => {
			this.$emit('change');
			this.currentFileState!.modified = true;
			if (pending) clearTimeout(pending);
			pending = setTimeout(async () => {
				await this.saveAllFiles(false);
			}, 5000);
		});

		//Create the code editor in the div
		let codeMirror2 : CodeMirror.Editor = CodeMirror(this.$refs.codeHolder2 as HTMLElement, {
			lineNumbers: true,
			gutters: ["CodeMirror-linenumbers", "CodeMirror-lint-markers"],
			tabSize: 4,
			value: "",
			mode: WHILE,
			theme: this.isDarkTheme ? DARK_THEME : LIGHT_THEME,
			readOnly: true,
		});
		codeMirror2.setSize("100%", "100%");
		this.editor2 = codeMirror2;
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
		currentTabIndex: {
			get(): number {
				if (this.currentTabFile === undefined) return -1;
				return this.openFiles.indexOf(this.currentTabFile);
			},
			set(val: number): void {
				this.currentTabFile = val === -1 ? undefined : this.openFiles[val];
			},
		},
		currentTabFile: {
			get(): string|undefined {
				return this.$store.state.focusedFile;
			},
			set(val: string|undefined): void {
				this.$store.commit('openFiles.setFocused', val);
			},
		},
		currentFileState: {
			get(): FileInfoState|undefined {
				if (this.currentTabFile === undefined) return undefined;
				return this.$store.state.fileLookup[this.currentTabFile];
			},
			set(val: FileInfoState|undefined): void {
				this.currentTabFile = val?.id;
			},
		},
		openFileStates(): FileInfoState[] {
			return this.openFiles.map(c => this.$store.state.fileLookup[c]);
		},
		allowExtended(): boolean {
			if (this.currentFileState === undefined) return true;
			return this.currentFileState.extWhile;
		},
		showSecondEditor(): boolean {
			return this.secondEditorContent !== undefined || this.errorList.length > 0;
		},
		errorList(): string[] {
			return this.currentFileState?.secondEditorErrorList || [];
		},
		showErrorList(): boolean {
			return this.showSecondEditor && this.errorList.length > 0;
		},
		stateOpenFiles(): string[] {
			return this.$store.state.openFiles;
		},
		cwd(): string {
			return this.$store.state.current_directory;
		},
	},
	methods: {
		onDragEnd(event: SortableEvent): any {
			//If the focused tab was being dragged, update the index
			if (event.oldIndex === this.currentTabIndex) {
				this.currentTabIndex = event.newIndex!;
			}
		},

		toggleBreakpoint(doc: CustomMirrorDoc, line: number|CodeMirror.LineHandle, enabled?: boolean) {
			if (!this.currentTabFile) return;
			const isEnabled = doc.toggleBreakpoint(line, enabled);

			let lineNo: number = (typeof line === 'number') ? line : doc.getLineNumber(line)!;
			lineNo++;
			if (isEnabled) {
				this.$store.commit('breakpoint.add', [lineNo, this.currentTabFile]);
			} else {
				this.$store.commit('breakpoint.del', [lineNo, this.currentTabFile]);
			}

			const prog_folder = path.dirname(this.currentTabFile);
			//Update any debuggers in the file's directory with the new breakpoint
			for (let { runner } of this.$store.state.programRunners) {
				//Check the runner is operating in the same directory as the program
				if (path.relative(runner.directory, prog_folder) === '') {
					const r: AbstractRunner = runner;
					if (r.isStopped) continue;
					if (isEnabled) {
						//Add the breakpoint to the runner
						if (r.addBreakpoints) r.addBreakpoints({line: lineNo, prog: this.currentTabFile});
					} else {
						//Remove the breakpoint from the runner
						if (r.delBreakpoints) r.delBreakpoints({line: lineNo, prog: this.currentTabFile});
					}
				}
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

		async _openFile(filepath: string|undefined): Promise<FileInfoState> {
			let content: string = '';

			if (filepath) {
				//Check to see if the file already exists as a tab
				let fileTabIndex: number = this.openFileStates.findIndex(f => f.path === filepath);
				if (fileTabIndex > -1) {
					//Switch to the existing tab
					this.currentTabFile = filepath;
					return this.currentFileState!;
				}
				//Load the file content from the file into an CodeMirror Doc
				content = await this._readFile(filepath);
			}

			//Open the file in the editor
			let tabInfo: FileInfoState = new FileInfoState(
				filepath ? path.basename(filepath) : 'untitled',
				filepath,
				{
					docOptions: { text: content }
				}
			);
			//Open the file in a new tab and switch to it
			this.$store.commit('openFile.open', tabInfo);
			this.currentTabFile = tabInfo.id;

			//Set up the breakpoints in the document if there are any saved
			let breakpoints: {prog:string, line:number}[] = this.$store.state.breakpoints;
			for (let {line} of breakpoints.filter(b => b.prog === filepath)) {
				const lineHandle = tabInfo.doc.getLineHandle(line);
				if (lineHandle) tabInfo.doc.toggleBreakpoint(lineHandle, true);
			}

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
				this.$store.commit('openFile.close', tab.id);
			}
		},
		async _saveFile(tab: FileInfoState, allowSaveAs = true): Promise<boolean> {
			if (tab.path === undefined) {
				//Prompt for saving the file to a new location, then try again
				if (!allowSaveAs) return false;
				return await this._saveFileAs(tab);
			}
			//Write the file to persistent storage
			await this._writeFile(tab.path, tab.doc.getValue());
			//Mark the file as saved in the editor
			tab.doc.markClean();
			tab.modified = false;
			return true;
		},
		async _saveFileAs(tab: FileInfoState): Promise<boolean> {
			//Prompt for saving the file to a new location, then try again
			this.currentFileState = tab;
			this.showSaveAsDialog = true;
			return new Promise<boolean>((resolve) => this.saveAsResolver = resolve);
		},
		async _writeFile(filepath: string, content: string): Promise<void> {
			if (!fs.existsSync(path.dirname(filepath))) {
				fs.promises.mkdir(path.dirname(filepath), { recursive: true });
			}
			await fs.promises.writeFile(filepath, content, { encoding: ENCODING_UTF8 });
		},

		async saveDialogSaveClick() {
			if (!this.closingTab) return;
			//Save the file
			await this._saveFile(this.closingTab);
			//Close the tab
			this.$store.commit('openFile.close', this.closingTab.id);
			//Hide the popup
			this.showSaveDialog = false;
			this.closingTab = undefined;
		},
		saveDialogNoSaveClick() {
			if (!this.closingTab) return;
			//Close the tab
			this.$store.commit('openFile.close', this.closingTab.id);
			//Hide the popup
			this.showSaveDialog = false;
			this.closingTab = undefined;
		},
		async handleSaveAs(filePath: string|undefined, allowSaveAs: boolean = true): Promise<void> {
			if (this.currentFileState && filePath) {
				this.currentFileState.name = path.basename(filePath);
				this.currentFileState.path = filePath;
				await this._saveFile(this.currentFileState, allowSaveAs);
			}
			if (this.saveAsResolver) this.saveAsResolver(!!(this.currentFileState && filePath));
		},

		async saveAllFiles(allowSaveAs: boolean = true): Promise<void> {
			for (let t of this.openFileStates) {
				await this._saveFile(t, allowSaveAs);
			}
		},

		_onFileStateSecondEditorChange(val: string|undefined) {
			this.secondEditorContent = val;
		}
	},
	watch: {
		editor(new_val) {
			this.$emit("editorChange", new_val);
		},
		currentFileState(currentFileState: FileInfoState|undefined, oldFileState: FileInfoState|undefined) {
			if (!this.editor) throw new Error("Couldn't get code editor");

			oldFileState?.off('secondEditorContent', this._onFileStateSecondEditorChange);
			this.secondEditorContent = undefined;
			currentFileState?.on('secondEditorContent', this._onFileStateSecondEditorChange);

			if (currentFileState === undefined) {
				//Prevent writing in the editor if there are no files open
				//This shouldn't happen
				this.editor.swapDoc(CodeMirror.Doc(''));
				this.editor.setOption('readOnly', true);
			} else {
				//Load the new tab's content into the editor
				this.editor.swapDoc(currentFileState.doc);
				this.editor.setOption('readOnly', false);
				this.secondEditorContent = currentFileState.secondEditorContent;
				//Trigger a lint of the new content
				this.triggerLint();
			}
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
		stateOpenFiles(stateOpenFiles: string[]): void {
			this.openFiles = stateOpenFiles;
		},
		openFiles(openFiles: string[]) {
			//Ensure the current selected tab is actually open
			if (this.currentTabFile !== undefined && !openFiles.includes(this.currentTabFile)) {
				if (openFiles.length > 0) {
					this.currentTabFile = openFiles[openFiles.length - 1];
				} else {
					this.currentTabFile = undefined;
				}
			}

			if (this.currentTabFile === undefined) {
				this._openFile(undefined).then((fileInfoState: FileInfoState) => {
					this.currentFileState = fileInfoState;
				});
			}

			if (openFiles === this.stateOpenFiles) return;

			//Update the open files list in the VueX store
			this.$store.commit('openFiles.set', openFiles);
		},
		secondEditorContent(secondEditorContent: string|undefined) {
			if (secondEditorContent !== undefined)
			this.editor2?.getDoc().setValue(secondEditorContent)
		},
		showSecondEditor(showSecondEditor: boolean) {
			if (showSecondEditor) {
				this.$nextTick(() => {
					this.editor2?.refresh();
				})
			}
		},

		showSaveAsDialog(showFilePicker: boolean): void {
			if (showFilePicker && electron) {
				this.showSaveAsDialog = false;

				electron.remote.dialog.showSaveDialog(null, {
					defaultPath: path.join(this.cwd, 'myfile.while'),
					filters: [
						{ name: 'WHILE files', extensions: ['while'] },
						{ name: 'All files', extensions: ['*'] },
					],
					properties: ['showOverwriteConfirmation', 'createDirectory']
				}).then((result: SaveDialogReturnValue) => {
					if (!result.filePath) return;
					this.handleSaveAs(result.filePath);
				});
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

	/*font-family: Arial, monospace;*/
	font-size: 15px;
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
	overflow-y: hidden !important;
}

.editor-container {
	flex: 1;
	overflow-y: hidden;
}

.editor-col {
	display: flex;
	flex-direction: column;
	overflow: auto !important;
}

.errorHolder {
	flex: 1;
	max-height: 10em;
	overflow-y: auto;
	width: 100%;
	text-align: left;
}

.errorLine > .errorIcon {
	color: #BB0000;
	margin-right: 10px;
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

.hidden {
	display: none;
}
</style>