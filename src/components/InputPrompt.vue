<template>
	<div class="InputPrompt" v-if="controls.visible">
		<div class="content">
			<div class="messageHolder">
				<h1 class="title" v-if="controls.title">{{ controls.title }}</h1>
				<p class="message">{{ controls.message }}</p>
			</div>
			<div>
				<div class="inputHolder">
					<div v-if="controls.inputType === 'string'">
						<input type="text" v-model="inputs.string" />
					</div>
					<div v-if="controls.inputType === 'number'">
						<input type="number" v-model="inputs.number" />
					</div>
					<div v-else-if="isPathInput">
						<FilePicker
							:directory="cwd"
							@change="onFileClick"
						/>
						<div>
							<span>Selected: </span><span v-if="inputs.path" v-text="inputs.path.fullPath"/>
						</div>
					</div>
				</div>

				<div>
					<input type="button"
							@click="onSubmitClick"
							:value="expectingInput ? 'Submit' : 'Ok'"
					/>

					<input type="button"
							:class="{ 'hidden': !expectingInput }"
							@click="onCancelClick"
							value="Cancel"
					/>
				</div>

				<div class="errorHolder" v-if="controls.error">
					<p class="error">{{ controls.error }}</p>
				</div>
			</div>
			</div>
	</div>
</template>

<script lang="ts">
import vue from "vue";
import IOController, { InputPromptParams, InputPromptTypes, OutputPromptParams } from "@/api/types/IOController";
import FilePicker from "@/components/FilePicker.vue";
import { AbstractInternalFile } from "@/files/InternalFile";

interface DataTypeDescriptor {
	inputs: {
		string?: string;
		number?: number;
		path?: AbstractInternalFile;
	}
	ioController: IOController;
	controls: {
		visible: boolean;
		title: string;
		message: string;
		error: string;
		inputType: InputPromptTypes|"none";
		callback: (val?: string) => void;
		cancelCallback: () => void;
	}
}

export default vue.extend({
	name: 'InputPrompt',
	components: {
		FilePicker
	},
	props: {
		cwd: {
			type: String,
			default: '.',
		}
	},
	data() : DataTypeDescriptor {
		return {
			inputs: {
				number: undefined,
				path: undefined,
				string: undefined,
			},
			//Will only be in this state until `mounted` is run
			ioController: {} as IOController,
			//Control over the UI
			controls: {
				visible: false,
				title: "",
				message: "",
				error: "",
				inputType: "none",
				callback: () => {},
				cancelCallback: () => {},
			}
		}
	},
	computed: {
		expectingInput() : boolean {
			return this.controls.inputType !== 'none';
		},
		isPathInput() : boolean {
			return ['path','file','folder'].includes(this.controls.inputType);
		},
	},
	mounted() {
		this.ioController = {
			showOutput: (props: OutputPromptParams) : Promise<void> => {
				return new Promise(resolve => {
					//Make visible
					this.controls.visible = true;
					//Don't the text box
					this.controls.inputType = "none";
					//Set the message to show
					this.controls.title = props.title || "";
					this.controls.message = props.message;
					//When the user submits
					this.controls.callback = () => {
						//Hide the prompt
						this._hideInput();
						//Done
						resolve();
					};
				});
			},
			getInput: (props: InputPromptParams) : Promise<string|undefined> => {
				return new Promise(resolve => {
					//Make visible
					this.controls.visible = true;
					//Show the text box
					const inputType = props.type || "string";
					this.controls.inputType = inputType;
					//Show the message
					this.controls.title = props.title || "";
					this.controls.message = props.message;
					//When the user enters the value
					this.controls.callback = (val? : string) => {
						//Validate the file path
						if (["file","folder","path"].includes(inputType)) {
							//TODO: Refactor to allow this to use `val`
							if (!this.inputs.path) {
								this.controls.error = "Choose a path";
								return;
							}
							if (inputType === "file" &&  !this.inputs.path.file) {
								this.controls.error = "Choose a file";
								return;
							}
							if (inputType === "folder" &&  !this.inputs.path.folder) {
								this.controls.error = "Choose a folder";
								return;
							}
						}

						//Check with the validator, or return true
						if (!props.validator || props.validator(val!)) {
							this.controls.error = "";
							//Hide the prompt
							this._hideInput();
							//Done
							resolve(val);
						} else {
							this.controls.error = "Invalid input";
						}
					};
					//If the user cancels the operation
					this.controls.cancelCallback = () => {
						this._hideInput();
						resolve(undefined);
					};
				});
			},
		};
	},
	methods: {
		onFileClick(file: AbstractInternalFile) {
			//Clear any shown errors
			this.controls.error = "";

			if (this.controls.inputType === "path") {
				//Allow any existing path
				this.inputs.path = file;
			} else if (this.controls.inputType === "file") {
				//Require a file
				if (file.file) this.inputs.path = file;
				else this.controls.error = "You must select a file";
			} else if (this.controls.inputType === "folder") {
				//Require a folder
				if (file.folder) this.inputs.path = file;
				else this.controls.error = "You must select a folder";
			}
		},

		onSubmitClick() {
			if (!this.controls.callback) return;

			//Get parameters to feedback to the controller
			let result : string|undefined;
			switch (this.controls.inputType) {
				case "none":
					result = undefined;
					break;
				case "number":
					result = this.inputs.number!.toString();
					break;
				case "file":
				case "folder":
				case "path":
					result = this.inputs.path ? this.inputs.path.fullPath : '';
					break;
				case "string":
				default:
					result = this.inputs.string;
			}
			//Call the input's callback
			if (result === undefined) this.controls.callback();
			else this.controls.callback(result);
		},
		onCancelClick() {
			if (!this.controls.cancelCallback) return;
			//Call the cancel callback
			this.controls.cancelCallback();
		},

		async _hideInput() : Promise<void> {
			//Make the input invisible
			this.controls.visible = false;
			//Default to allowing input
			this.controls.inputType = 'string';
			//Clear the message
			this.controls.title = "";
			this.controls.message = "";
			//Clear the callback
			this.controls.callback = () => {};
			this.controls.cancelCallback = () => {};
		},
	},
	watch: {
		ioController(controller: IOController) {
			this.$emit("controller", controller);
		}
	}
})
</script>


<style scoped>
.InputPrompt .title {
	font-size: larger;
	text-decoration: underline;
}

.errorHolder .error {
	color: red;
}

/*noinspection CssUnusedSymbol*/
.hidden {
	display: none;
}

/*
Popup stylings based broadly on W3Schools':
https://www.w3schools.com/howto/howto_css_modals.asp
*/
.InputPrompt {
	position: fixed;
	z-index: 5;

	/*Fill the entire screen*/
	left: 0;
	top: 0;
	width: 100%;
	height: 100%;

	/*Transparent background, with non-transparent fallback*/
	background-color: rgb(0,0,0);
	background-color: rgba(0,0,0,0.4);
}
.InputPrompt .content {
	background-color: #FFFFFF;
	padding: 20px;
	border: 1px solid #888;
	margin: 15% auto;
	width: 50%;
	overflow: auto;
}
</style>
