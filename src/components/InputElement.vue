<template>
	<div class="InputElement">
		<div v-if="type === 'label' || type === 'string' || type === 'number'">
			<p
				v-if="type === 'label'"
				v-text="descriptor"
			/>

			<StringInputElement
				v-else-if="type === 'string'"
				:name="descriptor.name"
				:placeholder="descriptor.placeholder"
				:value="descriptor.value || descriptor.default"
				@change="handleChange"
				@error="handleError"
			/>

			<NumberInputElement
				v-else-if="type === 'number'"
				:name="descriptor.name"
				:placeholder="descriptor.placeholder"
				:value="descriptor.value || descriptor.default"
				@change="handleChange"
				@error="handleError"
			/>

			<span
				class="help-button"
				v-if="descriptor.description"
				id="help-button"
				v-tooltip="helpTooltip"
				v-text="'?'"
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
import { vars } from '@/utils/globals';
import StringInputElement from "@/components/_internal/inputs/StringInput.vue";
import NumberInputElement from "@/components/_internal/inputs/NumberInput.vue";
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
	vars: typeof vars;
}

export default Vue.extend({
	name: 'InputElement',
	components: {
		TreeInputElement,
		FileInputElement,
		NumberInputElement,
		StringInputElement,
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
			vars,
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
span.help-button {
	display: inline-block;
	text-align: center;
	background-color: lightgrey;
	border-radius: 1em;
	width: 1em;
	height: 1em;
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
