<template>
	<v-app id="app">
		<v-main>
			<router-view></router-view>
		</v-main>

		<InputPrompt @controller="ioControllerChange" />
	</v-app>
</template>

<script lang="ts">
import Vue from "vue";
import InputPrompt from "@/components/InputPrompt.vue";
import { IOController } from "@/types";

let ioController: IOController|undefined;

export default Vue.extend({
	name: 'app',
	components: {
		InputPrompt
	},
	methods: {
		ioControllerChange(controller?: IOController) {
			ioController = controller;
		}
	},
});

Vue.config.errorHandler = function (err, _, info) {
	let msg = `${err.toString()}\nInfo: ${info}`;
	//Log the error
	console.error(msg);
	//Show in a popup
	ioController?.prompt({
		title: `Uncaught Error: ${err.name}`,
		message: msg,
		options: ['Ok']
	});
}

window.onerror = function (msg:Event|string, url?:string, line?:number, col?:number, err?:Error) {
	//https://developer.mozilla.org/en-US/docs/Web/API/GlobalEventHandlers/onerror
	let message: string = '';
	if (err) message = err.toString() + '\n';
	message += `Info: ${msg}`;

	//Log the error
	console.error(message);
	//Show in a popup
	ioController?.prompt({
		title: `Uncaught Error: ${err ? err.name : 'Unknown Error'}`,
		message: message,
		options: ['Ok']
	});
}
</script>

<!--suppress CssUnusedSymbol -->
<style>
@import "../styles/v-tooltip.css";

#app {
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
}

#app {
	display: flex;
	flex-direction: column;

	height: 100%;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}
</style>