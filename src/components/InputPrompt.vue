<template>
	<div class="inputModal" v-if="controls.visible">
		<div class="content">
			<div class="InputPrompt">
				<div class="messageHolder">
					<h1 class="title" v-if="controls.title">{{ controls.title }}</h1>
					<p class="message">{{ controls.message }}</p>
				</div>
				<div>
					<div class="inputHolder" v-if="controls.expectingInput">
						<div>
							<input v-model="input" />
							<input type="button" @click="onSubmitClick" value="Submit" />
						</div>

						<input type="button" @click="onCancelClick" value="Cancel" />

						<div class="errorHolder" v-if="controls.error">
							<p class="error">{{ controls.error }}</p>
						</div>
					</div>
					<div class="inputHolder" v-else>
						<input type="button" @click="onSubmitClick" value="Ok" />
					</div>
				</div>
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import vue from "vue";
import IOController, { InputPromptParams, OutputPromptParams } from "@/api/types/IOController";

//TODO: Allow externally setting/resetting input value

interface DataTypeDescriptor {
	input: string;
	ioController: IOController;
	controls: {
		visible: boolean;
		title: string;
		message: string;
		error: string;
		expectingInput: boolean;
		callback: (val?: string) => void;
		cancelCallback: () => void;
	}
}

export default vue.extend({
	name: 'InputPrompt',
	data() : DataTypeDescriptor {
		return {
			input: "",
			//Will only be in this state until `mounted` is run
			ioController: {} as IOController,
			//Control over the UI
			controls: {
				visible: false,
				title: "",
				message: "",
				error: "",
				expectingInput: true,
				callback: () => {},
				cancelCallback: () => {},
			}
		}
	},
	mounted() {
		this.ioController = {
			showOutput: (props: OutputPromptParams) : Promise<void> => {
				return new Promise(resolve => {
					//Make visible
					this.controls.visible = true;
					//Don't the text box
					this.controls.expectingInput = false;
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
					this.controls.expectingInput = true;
					//Show the message
					this.controls.title = props.title || "";
					this.controls.message = props.message;
					//When the user enters the value
					this.controls.callback = (val? : string) => {
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
		onSubmitClick() {
			if (!this.controls.expectingInput) this.onInputSubmit();
			else this.onInputSubmit(this.input);
		},
		onCancelClick() {
			this.$emit("cancel");
			this.onInputCancel();
		},

		async _hideInput() : Promise<void> {
			//Make the input invisible
			this.controls.visible = false;
			//Default to allowing input
			this.controls.expectingInput = true;
			//Clear the message
			this.controls.title = "";
			this.controls.message = "";
			//Clear the callback
			this.controls.callback = () => {};
			this.controls.cancelCallback = () => {};
		},
		onInputSubmit(val?: string) : void {
			//Call the input's callback
			if (this.controls.callback) {
				this.controls.callback(val);
			}
		},
		onInputCancel() : void {
			//Call the input's cancel callback
			if (this.controls.cancelCallback) {
				this.controls.cancelCallback();
			}
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
.InputPrompt {

}

.InputPrompt .title {
	font-size: larger;
	text-decoration: underline;
}

.InputPrompt .message {

}

.errorHolder .error {
	color: red;
}

/*
Popup stylings based broadly on W3Schools':
https://www.w3schools.com/howto/howto_css_modals.asp
*/
.inputModal {
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
.inputModal .content {
	background-color: #FFFFFF;
	padding: 20px;
	border: 1px solid #888;
	margin: 15% auto;
	width: 50%;
	overflow: auto;
}
</style>
