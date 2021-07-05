<template>
	<label :class="{'active': currentState}" class="ToggleSwitch">
		<input type="checkbox" v-model="currentState">
		<span class="switch"></span>
	</label>
</template>

<script lang="ts">
import Vue from "vue";

interface DataDescriptor {
	currentState: boolean;
}

export default Vue.extend({
	name: 'ToggleSwitch',
	props: {
		value: Boolean,
	},
	data(): DataDescriptor {
		return {
			currentState: false
		}
	},
	watch: {
		currentState(state: boolean) {
			this.$emit('change', state);
		},
		value(val: boolean) {
			this.currentState = val;
		}
	},
});
</script>

<style scoped>
.ToggleSwitch {
	vertical-align: middle;
	user-select: none;
	cursor: pointer;
}

.ToggleSwitch input[type="checkbox"] {
	position: absolute;
	opacity: 0;
	width: 0;
	height: 0;
}

.ToggleSwitch .switch {
	display: inline-block;
	position: relative;
	height: 10px;
	border-radius: 6px;
	width: 40px;
	background: #CCCCCC;
	margin: 0 5px;
}

.ToggleSwitch .switch::after,
.ToggleSwitch .switch::before {
	content: "";
	position: absolute;
	height: 18px;
	width: 18px;
	border-radius: 50%;
	left: 0;
	top: -4px;
	transition: all .25s cubic-bezier(0, 0, .5, 1.5);
}

.ToggleSwitch .switch::after {
	background: #666666;
}
.ToggleSwitch .switch::before {
	opacity: 0;
}

.active .switch {
	background: lightblue;
}

.active .switch::after {
	left: calc(100% - 18px);
	background: steelblue;
}
</style>