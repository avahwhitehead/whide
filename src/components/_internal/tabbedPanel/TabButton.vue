<template>
	<div class="tabButton" :class="{ 'active': active }" @click="handleClick" @click.middle="handleClose">
		<p class="title">{{ title }}</p>
		<font-awesome-icon class="closeIcon" icon="times" @click.stop="handleClose" />
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import { library } from '@fortawesome/fontawesome-svg-core';
import { faTimes } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';

library.add(faTimes);

interface DataTypeInterface { }

export default Vue.extend({
	name: 'TabButton',
	components: {
		FontAwesomeIcon
	},
	props: {
		title: {
			type: String,
			required: true,
		},
		active: {
			type: Boolean,
			default: false,
		},
	},
	data() : DataTypeInterface {
		return {}
	},
	methods: {
		handleClick() : void {
			this.$emit("click");
		},
		handleClose() : void {
			this.$emit("close");
		},
	}
});
</script>


<style scoped>
.tabButton {
	display: inline-block;
	background-color: #EEEEEE;
	margin: 3px;
	padding: 2px;
	border-radius: 5px 5px 0 0;
	border: 1px solid #808080;
	border-bottom: none;
}

/*noinspection CssUnusedSymbol*/
.tabButton.active {
	background-color: #FFFFFF;
}

.title {
	display: inline-block;
	margin: 0;
	padding: 2px;
	vertical-align: middle;
	user-select: none;
}

.closeIcon {
	color: grey;
	padding: 2px;
	vertical-align: top;
}

.closeIcon:hover {
	cursor: pointer;
	color: red;
}
</style>
