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
	EditorController as EditorControllerInterface,
} from "@/types";
import { EventEmitter } from "events";
//The code editor
import CodeMirror, { Doc, LineWidget } from "codemirror";
//CodeMirror styling
import 'codemirror/lib/codemirror.css';
//While language syntax definition
import WHILE from "@/assets/whileSyntaxMode";
import { AbstractInternalFile, InternalFile, pathToFile } from "@/files/InternalFile";
import InputPrompt from "@/components/InputPrompt.vue";
import { IOController } from "@/types";


interface DataType {
	selectedFile: InternalFile|undefined;
	editor: CodeMirror.Editor|undefined;
	editorController: EditorControllerInterface|undefined;
	ioController: IOController|undefined;
	openFiles: InternalFile[];
	docs: Map<string, Doc>,
	errors : LineWidgetType[];
	infos : LineWidgetType[];
	warnings : LineWidgetType[];
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
			errors: [],
			infos: [],
			warnings: [],
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
		this.editor = codeMirror;

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
			this.editorController!.getBreakpoints();

		}
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