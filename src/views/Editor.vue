<template>
	<div class="editor">
		<div class="header filler">
			<div class="menubar-holder">
				<MenuBar :menus="menus" />
			</div>
			<div class="right">
				<button @click="openTreeViewer">Tree Viewer</button>
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
import { EditorController, IOController, RunPanelController } from "@/types";
import { AbstractInternalFile, InternalFile } from "@/files/InternalFile";
import { InternalMenu } from "@/api/types/InternalMenus";
import { vars } from "@/utils/globals";
import path from "path";
import { fs } from "@/files/fs";
import CodeMirror from "codemirror";
import { CustomDict } from "@/types/CustomDict";

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	focused_file? : InternalFile;
	codeEditor? : CodeMirror.Editor;
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
			const _displayError = async (error: string) => {
				console.error(error);
				if (!this.ioController) {
					console.error("Couldn't get IO Controller");
					return;
				}
				await this.ioController.showOutput({
					message: error,
					title: "An error occurred"
				});
			}

			return [
				{
					"name": "File",
					"children": [
						{
							"name": "New",
							"children": [
								{
									name: "New File",
									args: [
										{
											name: "Parent Folder",
											description: "Choose the folder to hold the file",
											type: 'folder',
										},
										{
											name: "File Name",
											description: "Name of the file",
											validator: function (name) {
												return !!name.match(/^[a-zA-Z0-9_ \-.]+$/);
											},
										}
									],
									command({args} : { args: CustomDict<string> }) {
										const parent = args["Parent Folder"];
										const name = args["File Name"];
										//Build the full file path
										const full_path = path.join(parent, name);

										try {
											//Check the file doesn't already exist
											if (fs.existsSync(full_path)) {
												_displayError(`The file "${name}" already exists in "${parent}"`);
												return;
											}
											//Create the file
											fs.writeFile(full_path, "", err => {
												if (err) _displayError(err.message);
												else console.log(`Successfully created file "${full_path}"`);
											});
										} catch (e) {
											_displayError(e);
										}
									}
								},
								{
									name: "New Folder",
									args: [
										{
											name: "Parent Folder",
											description: "Choose the folder to hold the new folder",
											type: 'folder',
										},
										{
											name: "Folder Name",
											description: "Name of the folder",
											validator(name) {
												return !!name.match(/^[a-zA-Z0-9_ \-.]+$/);
											},
										}
									],
									command({args} : { args: CustomDict<string> }) {
										const parent = args["Parent Folder"];
										const name = args["Folder Name"];
										//Build the full directory path
										const full_path = path.join(parent, name);

										try {
											//Check the folder doesn't already exist
											if (fs.existsSync(full_path)) {
												_displayError(`The folder "${name}" already exists in "${parent}"`);
												return;
											}
											//Create the folder
											fs.mkdir(full_path, err => {
												if (err) _displayError(err.message);
												else console.log(`Successfully created folder "${full_path}"`);
											});
										} catch (e) {
											_displayError(e);
										}
									}
								}
							]
						},
						{
							name: "Save",
							command: () => {
								this.editorController!.saveFiles();
							}
						},
						{ "name": "Download", "command": () => {
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
						}},
					]
				}
			];
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
		onEditorObjectChange(editor : CodeMirror.Editor) : void {
			this.codeEditor = editor;
		},
		dirChange(dir: string) {
			//Change the working directory
			this.cwd = dir;
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