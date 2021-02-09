<template>
	<div class="editor-message" :class="type">
		<span class="widget-icon" :class="type">{{ icon }}</span>
		{{ message }}
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

export default Vue.extend({
	name: 'editor-message',
	props: {
		message: {
			type: String,
			default: "",
		},
		type: {
			type: String as PropType<"error"|"warning"|"info"|"breakpoint">,
			default: "info",
		}
	},
	data() {
		return {}
	},
	computed: {
		icon() {
			switch (this.$props.type) {
				case "warning":
					return "!";
				case "error":
					return "x";
				case "breakpoint":
					return "\xa0";
				case "info":
				default:
					return "?";
			}
		},
	}
});
</script>


<style scoped>
.editor-message {
	width: 100%;
	font-size: 70%;
	color: #a00;
	background: #FFFFAA;
	padding: 2px 5px 3px;
	margin-left: 3.5em;
	opacity: 75%;
}
.editor-message.warning {
	background: darkorange;
}
.editor-message.error {
	background: red;
}
.editor-message.breakpoint {
	background: orangered;
}
.editor-message.info {
	background: orange;
}

.editor-message .widget-icon {
	color: white;
	background-color: red;
	font-weight: bold;
	border-radius: 50%;
	padding: 0 3px;
	margin-left: -3em;
}

.editor-message .widget-icon.warning {
	/*background-color: orange;*/
	background: darkorange;
}
.editor-message .widget-icon.error {
	background-color: red;
}
.editor-message .widget-icon.breakpoint {
	background-color: orangered;
}
.editor-message .widget-icon.info {
	background-color: orange;
}
</style>
