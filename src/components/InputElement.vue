<template>
	<div class="InputElement">
		<div>
			<p
				v-if="type === 'label'"
				v-text="descriptor"
			/>
			<StringInputElement
				v-else-if="type === 'string'"
				:name="descriptor.name"
				:placeholder="descriptor.placeholder"
				@change="handleChange"
				@error="handleError"
			/>
			<NumberInputElement
				v-else-if="type === 'number'"
				:name="descriptor.name"
				:placeholder="descriptor.placeholder"
				@change="handleChange"
				@error="handleError"
			/>
			<FileInputElement
				v-else-if="type === 'path' || type === 'file' || type === 'folder'"
				:type="type"
				@change="handleChange"
				@error="handleError"
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
import { InputPromptTypes } from "@whide/whide-types";

export type InputElementDescriptor = {
	name: string,
	type: InputPromptTypes,
	description?: string,
	placeholder?: string,
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
		}
	},
	methods: {
		handleChange(val: any) {
			this.$emit('change', val);
		},
		handleError(error: string) {
			this.errors.push(error);
		},
	}
})
</script>


<!--suppress CssUnusedSymbol -->
<style scoped>
.InputElement {
}

.error {
	color: red;
	display: block;
}

.file-picker {
	height: 20em;
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
