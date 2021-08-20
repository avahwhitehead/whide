<template>
	<div class="InputElement">
		<div class="input-el-holder" v-if="type === 'label' || type === 'string' || type === 'number'">
			<span
				v-if="type === 'label'"
				v-text="descriptor"
			/>

			<v-text-field
				class="input-element mt-0 pt-0"
				v-else-if="type === 'string'"
				v-model="inputs.string"
				:placeholder="descriptor.placeholder"
			/>

			<v-text-field
				class="input-element mt-0 pt-0"
				v-else-if="type === 'number'"
				v-model="inputs.number"
				:placeholder="descriptor.placeholder"
			/>

			<FontAwesomeIcon
				icon="question"
				class="help-button"
				v-if="descriptor.description"
				id="help-button"
				v-tooltip="helpTooltip"
			/>
		</div>

		<div v-else-if="type === 'path' || type === 'file' || type === 'folder'">
			<FileInputElement
				class="file-picker"
				:name="descriptor.name"
				:description="descriptor.description"
				:type="type"
				:value="descriptor.value || descriptor.default"
				@change="handleChange"
				@error="handleError"
			/>
		</div>

		<div v-else-if="type === 'tree'">
			<TreeInputElement
				class="file-picker"
				:value="descriptor.value || descriptor.default || 'nil'"
				@change="handleChange"
			/>
		</div>

		<div class="error-holder">
			<span
				class="error"
				v-text="error"
				v-for="(error, i) of errors"
				:key="i"
			/>
		</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { AbstractInternalFile } from "@/files/InternalFile";
import FileInputElement from "@/components/_internal/inputs/FileInput.vue";
import TreeInputElement from "@/components/_internal/inputs/TreeInput.vue";
import { InputPromptTypes } from "@/types";
import VTooltip from 'v-tooltip';

Vue.use(VTooltip);

export type InputElementDescriptor = {
	name: string,
	id?: string,
	type: InputPromptTypes,
	description?: string,
	placeholder?: string,
	value?: string|undefined,
	default?: string,
	validator?: (arg0: string) => Promise<boolean>,
}|string;

interface DataTypeDescriptor {
	inputs: {
		string?: string;
		number?: number;
		path?: AbstractInternalFile;
	},
	errors: string[];
}

export default Vue.extend({
	name: 'InputElement',
	components: {
		TreeInputElement,
		FileInputElement,
	},
	props: {
		descriptor: {
			type: [
				Object,	//TODO: This should be `InputElementDescriptor`
				String,
			],
		},
		value: {
			type: String,
			required: false,
		}
	},
	data(): DataTypeDescriptor {
		return {
			inputs: {
				string: undefined,
				number: undefined,
				path: undefined,
			},
			errors: [],
		};
	},
	computed: {
		type() : string|undefined {
			if (!this.descriptor) return undefined;
			if (typeof this.descriptor === 'string') return 'label';
			return this.descriptor.type;
		},
		helpTooltip() : any {
			return {
				content: this.descriptor.description,
				placement: "right",
			};
		}
	},
	methods: {
		handleChange(val: any) {
			this.$emit('change', val);
		},
		handleError(error: string) {
			this.errors = [error];
		},
	}
})
</script>


<!--suppress CssUnusedSymbol -->
<style scoped>
.input-el-holder {
	display: flex;
	flex-direction: row;
}

.input-element {
	flex: 1;
}

.help-button {
	flex-grow: 0;
	background-color: lightgray;
	border-radius: 1em;
	width: 2em;
	height: 2em;
	padding: 5px;
	margin-left: .5em;
}

.error {
	color: red;
	display: block;
}

.file-picker {
	height: fit-content;
}

.fade-enter-active, .fade-leave-active {
	transition: all .2s cubic-bezier(0, 0, 0, 0);
	height: 20em;
}
.fade-enter, .fade-leave-to {
	transform: scaleY(0) translateZ(0);
	height: 0;
}
</style>
