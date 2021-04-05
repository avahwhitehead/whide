<template>
	<div class="InputPrompt" v-if="controls.visible">
		<Modal :visible="controls.visible">
			<div slot="header" v-if="!expectingInput">
				<h3 v-text="controls.title" />
			</div>

			<div slot="body" class="content">
				<p v-text="controls.message" />

				<div class="inputHolder">
					<InputElement
						:descriptor="descriptor"
						@change="onInputChange"
					/>
				</div>
			</div>

			<div slot="footer">
				<input
					type="button"
					@click="onButtonClick(name)"
					:value="name"
					v-for="(name, i) of buttons" :key="i"
				/>
			</div>
		</Modal>
	</div>
</template>

<script lang="ts">
import vue from "vue";
import { InputPromptParams, InputPromptTypes, IOController, OutputPromptParams, PromptParams } from "@whide/whide-types";
import InputElement, { InputElementDescriptor } from "@/components/InputElement.vue";
import Modal from "@/components/_internal/inputs/Modal.vue";

interface DataTypeDescriptor {
	input?: string,
	ioController: IOController;
	controls: {
		visible: boolean;
		title: string;
		message: string;
		inputType: InputPromptTypes|"none";
		buttons?: string[],
		callback?: (val: string) => void;
	}
}

export default vue.extend({
	name: 'InputPrompt',
	components: {
		Modal,
		InputElement,
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
				buttons: [],
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
				name: this.controls.title,
				type: this.controls.inputType,
				description: this.controls.message,
			}
		},
		buttons(): string[] {
			//use the preferred buttons if possible
			if (this.controls.buttons && this.controls.buttons.length) {
				return this.controls.buttons;
			}
			//Or default to Ok/Cancel
			return ['Cancel', 'Ok'];
		}
	},
	mounted() {
		this.ioController = {
			showOutput: (props: OutputPromptParams) : Promise<void> => {
				return this.showOutput(props);
			},
			getInput: (props: InputPromptParams) : Promise<string|undefined> => {
				return this.getInput(props);
			},
			prompt: (props: PromptParams) : Promise<string> => {
				return this.prompt(props);
			},
		};
	},
	methods: {
		onButtonClick(name: string) {
			if (this.controls.callback) {
				this.controls.callback(name);
			}
		},
		onInputChange(val: string) {
			this.input = val;
		},
		async showOutput(props: OutputPromptParams) : Promise<void> {
			await this.prompt({
				title: props.title,
				message: props.message,
				options: ['Ok']
			});
		},
		async getInput(props: InputPromptParams) : Promise<string|undefined> {
			return new Promise(resolve => {
				this.controls = {
					//Make visible
					visible: true,
					//Show the text box
					inputType: props.type || "string",
					//Show the message
					title: props.title || "",
					message: props.message,
					buttons: ['Cancel', 'Submit'],
					//When the user enters the value
					callback: (val? : string) => {
						//Hide the prompt
						this._hideInput();

						//Return the input value
						//Or undefined if the user cancels
						if (val === 'Submit') resolve(this.input);
						else resolve(undefined);
					},
				};
			});
		},
		async prompt(props: PromptParams) : Promise<string> {
			return new Promise(resolve => {
				this.controls = {
					//Make visible
					visible: true,
					//Show the text box
					inputType: "none",
					//Show the message
					title: props.title || "",
					message: props.message,
					buttons: props.options || ['Ok'],
					//When the user enters the value
					callback: (val : string) => {
						//Hide the prompt
						this._hideInput();
						//Return the button click
						resolve(val);
					},
				};
			});
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
			this.controls.callback = undefined;
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

</style>
