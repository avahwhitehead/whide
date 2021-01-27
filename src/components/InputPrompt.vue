<template>
	<div class="InputPrompt">
		<div class="messageHolder">
			<h1 class="title" v-if="title">{{title}}</h1>
			<p class="message">{{ message }}</p>
		</div>
		<div>
			<div class="inputHolder" v-if="getInput">
				<div>
					<input v-model="input" />
					<input type="button" @click="onSubmitClick" value="Submit" />
				</div>

				<input type="button" @click="onCancelClick" value="Cancel" />

				<div class="errorHolder" v-if="error">
					<p class="error">{{error}}</p>
				</div>
			</div>
			<div class="inputHolder" v-else>
				<input type="button" @click="onSubmitClick" value="Ok" />
			</div>
		</div>
	</div>
</template>

<script lang="ts">
import vue from "vue";

//TODO: Allow externally setting/resetting input value

export default vue.extend({
	name: 'InputPrompt',
	props: {
		message: {
			type: String,
			default: "",
		},
		getInput: {
			type: Boolean
		},
		error: {
			type: String,
			default: "",
		},
		title: {
			type: String,
			default: "",
		}
	},
	data() {
		return {
			input: "",
		}
	},
	methods: {
		onSubmitClick() {
			if (!this.getInput) this.$emit("submit");
			else this.$emit("submit", this.input);
		},
		onCancelClick() {
			this.$emit("cancel");
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
</style>
