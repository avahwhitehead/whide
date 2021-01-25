<template>
	<div class="InputPrompt">
		<div class="messageHolder">
			<p>{{ message }}</p>
		</div>
		<div>
			<div class="inputHolder" v-if="getInput">
				<input v-model="input" />
				<input type="button" @click="onSubmitClick" value="Submit" />
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
		}
	}
})
</script>


<style scoped>
.InputPrompt {

}

.errorHolder .error {
	color: red;
}
</style>
