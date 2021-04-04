<template>
	<div class="InputPrompt" v-if="controls.visible">
		<div class="content">
			<div class="messageHolder">
				<h1 class="title" v-if="controls.title">{{ controls.title }}</h1>
				<p class="message">{{ controls.message }}</p>
			</div>
			<div>
				<div class="inputHolder">
					<InputElement
						:descriptor="descriptor"
						@change="onInputChange"
					/>
				</div>

				<div>
					<input
						type="button"
						@click="onSubmitClick"
						:value="expectingInput ? 'Submit' : 'Ok'"
					/>
					<input
						type="button"
						v-if="expectingInput"
						@click="onCancelClick"
						value="Cancel"
					/>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import vue from "vue";
import { InputPromptParams, InputPromptTypes, IOController, OutputPromptParams } from "@whide/whide-types";
import FilePicker from "@/components/FilePicker.vue";
import InputElement, { InputElementDescriptor } from "@/components/InputElement.vue";

interface DataTypeDescriptor {
	input?: string,
	ioController: IOController;
	controls: {
		visible: boolean;
		title: string;
		message: string;
		inputType: InputPromptTypes|"none";
		callback: (val?: string) => void;
		cancelCallback: () => void;
	}
}

export default vue.extend({
	name: 'InputPrompt',
	components: {
		InputElement,
		FilePicker
	},
	props: {

	},
	data() : DataTypeDescriptor {
		return {
			input: undefined,
			//Will only be in this state until `mounted` is run
			ioController: {} as IOController,
			//Control over the UI
			controls: {
				visible: false,
				title: "",
				message: "",
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
		descriptor() : InputElementDescriptor|undefined {
			if (this.controls.inputType === 'none') {
				return undefined;
			}
			return {
				name: 'Input',
				type: this.controls.inputType,
			}
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
					this.controls.inputType = props.type || "string";
					//Show the message
					this.controls.title = props.title || "";
					this.controls.message = props.message;
					//When the user enters the value
					this.controls.callback = (val? : string) => {
						//Hide the prompt
						this._hideInput();
						//Done
						resolve(val);
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
		onSubmitClick() {
			if (!this.controls.callback) return;
			//Get parameters to feedback to the controller
			let result : string|undefined = this.input
			//Call the input's callback
			if (result === undefined) this.controls.callback();
			else this.controls.callback(result);
		},
		onCancelClick() {
			if (!this.controls.cancelCallback) return;
			//Call the cancel callback
			this.controls.cancelCallback();
		},
		onInputChange(val: string) {
			this.input = val;
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
