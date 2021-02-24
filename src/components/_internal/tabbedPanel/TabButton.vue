<template>
	<div class="tabButton">
		<button @click="handleClick"><slot/></button>
		<font-awesome-icon class="closeIcon" icon="times" @click="handleClose" />
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
	border: 1px solid black;
	margin: 3px 5px;
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
