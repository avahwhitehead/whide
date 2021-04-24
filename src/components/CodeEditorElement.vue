<template>
	<div class="editorHolder">
		<TabbedPanel
			class="editor-tabs"
			:names="fileNames"
			:selected-tab="focusedName"
			@change="onTabChange"
			@close="onTabClose"
		/>
		<div class="codeHolder-container">
			<!-- This div will hold the code editor -->
			<div ref="codeHolder" class="codeHolder"></div>
		</div>

		<InputPrompt @controller="ioControllerChange"/>
	</div>
</template>


<script lang="ts">
import Vue, { PropType } from "vue";
import TabbedPanel from "@/components/TabbedPanel.vue";
import EditorWidget from "./_internal/codeEditor/EditorWidget.vue";
import BreakpointWidget from "./_internal/codeEditor/BreakpointWidget.vue";
import {
	CodeEditorWrapper,
	EditorController as EditorControllerInterface,
	ExtendedCodeEditorWrapper,
	LineWidgetType
} from "@whide/whide-types/";
import { wrapEditor } from "@/types/codeEditor";
import { EventEmitter } from "events";
//The code editor
import CodeMirror, { Doc } from "codemirror";
//CodeMirror styling
import 'codemirror/lib/codemirror.css';
//While language syntax definition
import WHILE from "@/assets/whileSyntaxMode";
import { AbstractInternalFile, InternalFile, pathToFile } from "@/files/InternalFile";
import InputPrompt from "@/components/InputPrompt.vue";
import { IOController } from "@whide/whide-types";

interface DataType {
	selectedFile: InternalFile|undefined;
	editor: ExtendedCodeEditorWrapper|undefined;
	editorController: EditorControllerInterface|undefined;
	ioController: IOController|undefined;
	openFiles: InternalFile[];
	docs: Map<string, Doc>,
}

async function addWidget(editor: CodeEditorWrapper, line: number|CodeMirror.LineHandle, element: HTMLElement) : Promise<CodeMirror.LineWidget> {
	return editor.addLineWidget(line, element, {
		above: true,
		coverGutter: true,
		noHScroll: true,
		handleMouseEvents: true,
	});
}

async function asLineHandle(editor: CodeEditorWrapper, line: number|CodeMirror.LineHandle) : Promise<CodeMirror.LineHandle> {
	if (typeof(line) === "number") return await editor.getLineHandle(line);
	return line;
}

async function makeWidget(editor : CodeEditorWrapper, line: number|CodeMirror.LineHandle, type: string, arr: LineWidgetType[]) : Promise<CodeMirror.LineWidget> {
	//Make a new widget element
	const node: Vue = new EditorWidget({
		propsData: { type: type }
	});
	node.$mount();
	//Show the widget on the editor
	const lineWidget = await addWidget(editor, line, node.$el as HTMLElement);
	//Save the line to the list
	arr.push({
		line: await asLineHandle(editor, line),
		widget: lineWidget,
	});
	return lineWidget;
}

function wrapExtendedCodeEditor(_editor : CodeEditorWrapper) : ExtendedCodeEditorWrapper {
	const breakpoints : CodeMirror.LineHandle[] = [];
	const errors : LineWidgetType[] = [];
	const infos : LineWidgetType[] = [];
	const warnings : LineWidgetType[] = [];

	return {
		editorWrapper: _editor,
		..._editor,

		addError:
			async (line: number|CodeMirror.LineHandle): Promise<CodeMirror.LineWidget> => makeWidget(_editor, line, 'error', errors),
		addInfo:
			async (line: number|CodeMirror.LineHandle): Promise<CodeMirror.LineWidget> => makeWidget(_editor, line, 'info', infos),
		addWarning:
			async (line: number|CodeMirror.LineHandle): Promise<CodeMirror.LineWidget> => makeWidget(_editor, line, 'warning', warnings),
		removeError:
			async (widget: CodeMirror.LineWidget): Promise<void> => _editor.removeLineWidget(widget),
		removeInfo:
			async (widget: CodeMirror.LineWidget): Promise<void> => _editor.removeLineWidget(widget),
		removeWarning:
			async (widget: CodeMirror.LineWidget): Promise<void> => _editor.removeLineWidget(widget),
		toggleBreakpoint: async (line: number|CodeMirror.LineHandle, enabled?: boolean) : Promise<void> => {
			//Line info
			const lineHandle: CodeMirror.LineHandle = await asLineHandle(_editor, line);
			let info = await _editor.lineInfo(line);

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
				breakpoints.push(lineHandle);
			} else {
				//Remove the line from the list of breakpoints
				const index = breakpoints.indexOf(lineHandle);
				if (index >= 0) breakpoints.splice(index, 1);
			}
			//Add/remove the marker to/from the gutter
			await _editor.setGutterMarker(line, "breakpoints", marker);
		},
		async getBreakpoints(): Promise<number[]> {
			let r : number[] = [];
			for (let handle of breakpoints) {
				//Convert the line handle to a number
				const n : number|null = await _editor.getLineNumber(handle);
				//If the line handle is valid, convert it to 1-index and add it to the result list
				if (n !== null) r.push(n + 1);
			}
			return r;
		},
		async getBreakpointLines(): Promise<CodeMirror.LineHandle[]> {
			return breakpoints;
		},
	};
}

/**
 * Partially implemented EditorController object to allow controlling the editor from within plugins
 */
abstract class EditorController extends EventEmitter implements EditorControllerInterface {
	protected constructor() {
		super();
	}

	abstract get editor() : ExtendedCodeEditorWrapper;
	abstract get focusedFile() : string|undefined;
	abstract get openFiles() : string[];

	abstract open(filePath: string) : Promise<void>;
	abstract close(filePath: string) : Promise<void>;
	abstract saveFiles() : Promise<void>;
}

export default Vue.extend({
	name: 'CodeEditorContainer',
	components: {
		InputPrompt,
		TabbedPanel,
	},
	props: {
		focused: {
			type: Object as PropType<InternalFile>,
			default: undefined,
		},
	},
	data() : DataType {
		return {
			selectedFile: undefined,
			//The code editor object.
			//Is undefined until the object is created in `mounted`
			editor: undefined,
			editorController: undefined,
			openFiles: [],
			ioController: undefined,
			docs: new Map(),
		}
	},
	mounted() {
		//Create the code editor in the div
		let codeMirror : CodeMirror.Editor = CodeMirror(this.$refs.codeHolder as HTMLElement, {
			lineNumbers: true,
			gutters: ["CodeMirror-linenumbers", "breakpoints"],
			tabSize: 4,
			value: "",
			mode: WHILE,
		});
		codeMirror.setSize("100%", "100%");
		//Wrap the editor in an asynchronous wrapper
		this.editor = wrapExtendedCodeEditor(wrapEditor(codeMirror));

		//Pass the change event (when the content changes at all) up to the next level
		this.editor.on("change", async () => {
			if (!this.editor) throw new Error("Couldn't get editor");

			let code = await this.editor.getValue();
			//Update the code in the open file, if available
			if (this.selectedFile) {
				this.selectedFile.content = code;
			} else {
				//TODO: Handle code change with no open files
			}
		});

		//Toggle breakpoints when the gutter is clicked
		this.editor.on("gutterClick", async (_:any, line: number|CodeMirror.LineHandle) => {
			if (!this.editor) throw new Error("Couldn't get editor");
			this.editor.toggleBreakpoint(line)
		});

		//Create the editor controller object
		const that = this;
		this.editorController = new (class extends EditorController {
			constructor() {
				super();
			}
			get editor(): ExtendedCodeEditorWrapper {
				return that.editor!;
			}
			get focusedFile(): string | undefined {
				return that.selectedFile?.fullPath;
			}
			get openFiles() : string[] {
				return Object.values(that.openFiles).map(f => f.fullPath);
			}
			async close(filePath: string): Promise<void> {
				this.emit('tab-close', filePath);
			}
			async open(filePath: string): Promise<void> {
				//Get the internal representation from the path
				const abstractFile : AbstractInternalFile = await pathToFile(filePath);
				//Don't edit folders
				if (abstractFile.folder) return;
				//Cast to a file
				let file : InternalFile = abstractFile as InternalFile;
				//Don't open the same file twice
				if (!this._isOpen(file.fullPath)) {
					//Read the file
					await file.read();
					//Open the file in the editor
					that.openFiles.push(file);
				}
				//Focus on this file
				that.selectedFile = file;
				this.emit('tab-focus', filePath);
			}
			async saveFiles(): Promise<void> {
				for (const file of that.openFiles) await file.write();
			}
			private _isOpen(filePath: string) : boolean{
				return !!that.openFiles.find(f => f.fullPath === filePath);
			}
		})();

		this.editorController.on('tab-close', (filePath: string) => {
			const file = this._indexFromFilePath(filePath);
			this.onTabClose(this.fileNames[file]);
		});
		this.editorController.on('tab-focus', (filePath: string) => {
			const file = this._indexFromFilePath(filePath);
			this.onTabChange(this.fileNames[file]);
		});
	},
	computed: {
		fileNames() : string[] {
			return this.openFiles.map(file => file.name);
		},
		focusedName() : string|undefined {
			return this.selectedFile ? this.selectedFile.name : undefined;
		},
	},
	methods: {
		/**
		 * Handle the active tab changing
		 * @param fileName		The new active tab
		 */
		onTabChange(fileName : string|undefined) : void {
			//Update the selected file
			if (fileName) this.selectedFile = this.openFiles[this._indexFromFileName(fileName)];
			else this.selectedFile = undefined;
			//Alert the external listeners
			this.$emit("fileFocus", this.selectedFile);
		},
		/**
		 * Handle a tab closing
		 * @param fileName		The tab which has closed
		 */
		async onTabClose(fileName: string) : Promise<void> {
			const index: number = this._indexFromFileName(fileName);
			const file: InternalFile = this.openFiles[index];

			if (file.modified) {
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
				if (res === 'Save') await file.write();
			}

			//Close the tab
			this.openFiles.splice(index, 1);
			this.docs.delete(file.fullPath);
		},

		/**
		 * Handle the IO controller updating
		 */
		ioControllerChange(controller: IOController) {
			this.ioController = controller;
		},

		_indexFromFileName(fileName: string) : number {
			return this.fileNames.indexOf(fileName);
		},
		_indexFromFilePath(filePath: string) : number {
			for (let i = 0 ; i < this.openFiles.length; i++) {
				if (this.openFiles[i].fullPath === filePath) return i;
			}
			return -1;
		},
	},
	watch: {
		editor(new_val) {
			this.$emit("editorChange", new_val);
		},
		/**
		 * Update the selected file when the parent element changes the focused file
		 */
		focused(newFile: InternalFile|undefined) {
			this.selectedFile = newFile;
		},
		/**
		 * Update the editor content when the selected file is changed (either direction)
		 */
		async selectedFile(newFile: InternalFile|undefined, oldFile: InternalFile|undefined) {
			if (!this.editor) throw new Error("Couldn't get code editor");

			//Use the path to the file to save the document state
			//Support using the editor without an open file by using the empty string
			let newFilePath = newFile?.fullPath || '';
			let oldFilePath = oldFile?.fullPath || '';

			//If the file is already open, use the existing Doc
			//Otherwise create a new one
			let newDoc: Doc = this.docs.get(newFilePath) || CodeMirror.Doc(newFile?.content || '', WHILE);
			//Swap the current doc out for the new one, saving the old one
			this.docs.set(oldFilePath, await this.editor.swapDoc(newDoc));
		},
		/**
		 * Emit an event when the editor controller object changes
		 */
		editorController(newController) {
			this.$emit("controller", newController);
		},
		/**
		 * Emit an event when the open files list changes
		 */
		openFiles(newOpenFiles: InternalFile[]) {
			this.$emit('filesChange', newOpenFiles);
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
	display: flex;
	flex: 1;
	flex-direction: column;
	overflow: hidden;
}

.codeHolder-container {
	overflow-y: auto;
	display: flex;
	flex: 1;
}

.codeHolder {
	text-align: left;
	flex: 1;
}

.editor-tabs {
	height: 2em;
	text-align: left;
}
</style>