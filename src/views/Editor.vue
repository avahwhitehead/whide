<template>
	<div class="editor">
		<div class="header filler">
			<div class="menubar-holder">
				<MenuBar :menus="menus" />
			</div>
			<div class="right">
				<button @click="openTreeViewer">Tree Viewer</button>
				<button @click="download" :disabled="!focused_file">Download File</button>
				<font-awesome-icon
					class="settings icon"
					icon="cog"
					title="Open Settings"
					@click="openSettings"
				/>
			</div>
		</div>

		<div class="body">
			<Container class="left filler">
				<button @click="handleChangeRootClick">Change Root</button>
				<FilePicker :directory="cwd" :load-level="2" @change="(file) => openFile(file)" @dir="dirChange"/>
			</Container>

			<Container class="middle code-editor no-scroll">
				<CodeEditorElement
					:focused="focused_file"
					@controller="onEditorControllerChange"
					@editorChange="onEditorObjectChange"
					@fileFocus="onFocusedFileChange"
				/>
			</Container>
		</div>

		<Container class="footer">
			<run-panel @controller="c => this.runPanelController = c" />
		</Container>

		<InputPrompt @controller="c => this.ioController = c" />
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import fileDownloader from "js-file-download";
//Components
import CodeEditorElement from "@/components/CodeEditorElement.vue";
import Container from "@/components/Container.vue";
import FilePicker from "@/components/FilePicker.vue";
import MenuBar from "@/components/MenuBar.vue";
import RunPanel from "@/components/RunPanel.vue";
import InputPrompt from "@/components/InputPrompt.vue";
//FontAwesome
import { library } from "@fortawesome/fontawesome-svg-core";
import { faCog } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(faCog);
//Other imports
import {
	EditorController,
	ExtendedCodeEditorWrapper,
	IOController,
	RunPanelController,
} from "@whide/whide-types";
import { AbstractInternalFile, InternalFile } from "@/files/InternalFile";
import { InternalMenu } from "@/api/types/InternalMenus";
import { vars } from "@/utils/globals";
import path from "path";

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	focused_file? : InternalFile;
	codeEditor? : ExtendedCodeEditorWrapper;
	editorController?: EditorController;
	ioController? : IOController;
	runPanelController?: RunPanelController;
	cwd: string;
}

export default Vue.extend({
	name: 'Editor',
	components: {
		InputPrompt,
		FilePicker,
		Container,
		CodeEditorElement,
		FontAwesomeIcon,
		MenuBar,
		RunPanel,
	},
	data() : DataTypesDescriptor {
		return {
			focused_file: undefined,
			codeEditor: undefined,
			editorController: undefined,
			ioController: undefined,
			runPanelController: undefined,
			cwd: vars.cwd,
		}
	},
	computed: {
		menus() : InternalMenu[] {
			return [];
		},
	},
	methods: {
		openTreeViewer() {
			let routeData = this.$router.resolve({ path: '/trees' });
			window.open(routeData.href, '_blank');
		},
		openSettings() {
			let routeData = this.$router.resolve({ path: '/settings' });
			window.open(routeData.href, '_blank');
		},
		async openFile(abstractFile: AbstractInternalFile) : Promise<void> {
			if (!this.editorController) throw new Error("Couldn't get editor controller instance");
			this.editorController.open(abstractFile.fullPath);
		},
		onFocusedFileChange(fileData : InternalFile|undefined) : void {
			//Keep track of the currently focused file
			this.focused_file = fileData || undefined;
		},
		onEditorControllerChange(editorController : EditorController) : void {
			this.editorController = editorController;
		},
		onEditorObjectChange(editor : ExtendedCodeEditorWrapper) : void {
			this.codeEditor = editor;
		},
		download() : void {
			if (this.focused_file) {
				fileDownloader(this.focused_file.content || "", this.focused_file.name);
			} else {
				if (!this.ioController) {
					console.error("Error: Couldn't get IO Controller");
					return;
				}
				this.ioController.prompt({
					title: 'No file to download',
					message: 'Open a file and try again',
					options: ['Ok']
				});
			}
		},
		dirChange(dir: string) {
			//Change the working directory
			this.cwd = dir;
		},
		getPaths(filePath: string) : string[] {
			let r = [filePath];
			while (filePath && filePath !== '/') {
				filePath = path.dirname(filePath);
				r.push(filePath);
			}
			return r;
		},
		handleChangeRootClick() {
			if (!this.ioController) throw new Error("Couldn't get IO Controller");
			this.ioController.getInput({
				title: "Choose folder root",
				message: "Select the folder to use as the new directory root",
				type: "folder"
			}).then((folder?: string) => {
				if (!folder) return;
				this.cwd = folder;
			})
		},
	},
	watch: {
		cwd(cwd: string): void {
			vars.cwd = cwd;
		}
	}
});
</script>

<style>
.code-editor {
	outline: 1px solid #AAA;
	width: 70%;
	display: inline-block;
}
</style>

<style scoped>
.editor {
	display: flex;
	flex-direction: column;
	width: 100%;
	height: 100%;
}

.menubar-holder {
	display: inline-block;
	float: left;
}
.header .right {
	float: right;
}

.no-scroll {
	overflow: hidden;
}

.settings.icon:hover {
	cursor: pointer;
	color: #555555;
}

.body {
	flex: 1;
	display: flex;
	min-height: 0;
	height: 100%;
}
.body .left {
	min-width: 10em;
	width: 10%;
}
.body .right {
	min-width: 10em;
	width: 15%;
}
.body .middle {
	flex: 1;
	display: flex;
	flex-direction: column;
}

.footer {
	height: fit-content;
	max-height: 30%;
}

/*
Fillers
*/

.filler {
	background: #999;
}

.header.filler, .footer .filler {
	background: #CCC;
	height: fit-content;
}

.header.filler {
	padding: 4px;
}

.footer .filler {
	background: #CCC;
}
</style>