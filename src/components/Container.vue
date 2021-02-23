<template>
	<div class="ContainerElement">
		<div class="left buttons" v-if="left && left.length">
			<div v-for="(icon,i) in left" v-bind:key="i">
				<font-awesome-icon class="button icon" :icon="icon" @click="() => onIconClick('left', icon)"/>
			</div>
		</div>

		<div class="middle">
			<div class="top buttons" v-if="top && top.length">
				<div v-for="(icon,i) in top" v-bind:key="i">
					<font-awesome-icon class="button icon" :icon="icon" @click="() => onIconClick('top', icon)"/>
				</div>
			</div>

			<div class="content">
				<slot></slot>
			</div>

			<div class="bottom buttons" v-if="bottom && bottom.length">
				<div v-for="(icon,i) in bottom" v-bind:key="i">
					<font-awesome-icon class="button icon" :icon="icon" @click="() => onIconClick('bottom', icon)"/>
				</div>
			</div>
		</div>

		<div class="right buttons" v-if="right && right.length">
			<div v-for="(icon,i) in right" v-bind:key="i">
				<font-awesome-icon class="button icon" :icon="icon" @click="() => onIconClick('right', icon)"/>
			</div>
		</div>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import { library } from '@fortawesome/fontawesome-svg-core';
import { fas } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome';
library.add(fas);

interface DataTypeInterface {

}

export default Vue.extend({
	name: 'Container',
	components: {
		FontAwesomeIcon
	},
	props: {
		top: {
			type: Array,
			default: () => [],
		},
		bottom: {
			type: Array,
			default: () => [],
		},
		left: {
			type: Array,
			default: () => [],
		},
		right: {
			type: Array,
			default: () => [],
		},
	},
	data() : DataTypeInterface {
		return { };
	},
	methods: {
		onIconClick(panel: string, icon: string) {
			//TODO: Is this the best event name format?
			const eventName = `${panel}-${icon}`;
			this.$emit(eventName);
		}
	}
});
</script>


<style scoped>
.ContainerElement {
	overflow: auto;
	padding: 5px;
	display: flex;
}

.content {
	flex: 1;
	text-align: left;
	overflow-wrap: anywhere;
	overflow-y: auto;
	width: 100%;
}

.middle {
	width: 100%;
}

.top.buttons, .bottom.buttons {
	padding: .25em 0;
	flex: 0;
}

.left.buttons, .right.buttons {
	width: 1em;
	padding: 0 .5em;
}

.top.buttons {
	border-bottom: 1px solid black;
}

.bottom.buttons {
	border-top: 1px solid black;
}

.left.buttons {
	border-right: 1px solid black;
}

.right.buttons {
	border-left: 1px solid black;
}

.left.buttons div, .right.buttons div, .top.buttons div, .bottom.buttons div {
	padding: 2px;
}

.top.buttons div, .bottom.buttons div {
	display: inline-block;
}

.left.buttons {
	float: left;
}

.right.buttons {
	float: right;
}

.button.icon {
	color: black;
}
</style>