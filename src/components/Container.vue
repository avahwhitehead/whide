<template>
	<div class="ContainerElement">
		<div class="top buttons" v-if="top && top.length">
			<button v-if="collapsible" @click="toggle_collapse">{{ collapsed ? "Show" : "Collapse" }}</button>
			<div v-for="(icon,i) in top" v-bind:key="i">
				<font-awesome-icon class="button icon" :icon="icon" @click="() => onIconClick('top', icon)"/>
			</div>
		</div>

		<div class="middle">
			<div class="left buttons" v-if="left && left.length">
				<div v-for="(icon,i) in left" v-bind:key="i">
					<font-awesome-icon class="button icon" :icon="icon" @click="() => onIconClick('left', icon)"/>
				</div>
			</div>

			<div class="content-holder">
				<div class="content" :class="{ 'collapsed' : collapsed, 'open' : !collapsed }">
					<slot></slot>
				</div>
			</div>

			<div class="right buttons" v-if="right && right.length">
				<div v-for="(icon,i) in right" v-bind:key="i">
					<font-awesome-icon class="button icon" :icon="icon" @click="() => onIconClick('right', icon)"/>
				</div>
			</div>
		</div>

		<div class="bottom buttons" v-if="bottom && bottom.length">
			<div v-for="(icon,i) in bottom" v-bind:key="i">
				<font-awesome-icon class="button icon" :icon="icon" @click="() => onIconClick('bottom', icon)"/>
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
	collapsed: boolean;
}

export default Vue.extend({
	name: 'Container',
	components: {
		FontAwesomeIcon
	},
	props: {
		collapsible: {
			type: Boolean,
			default: true
		},
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
		return {
			collapsed: false
		}
	},
	methods: {
		toggle_collapse() : void {
			this.collapsed = !this.collapsed;
		},
		onIconClick(panel: string, icon: string) {
			//TODO: Is this the best event name format?
			const eventName = `${panel}-${icon}`;
			this.$emit(eventName);
		}
	}
});
</script>


<style scoped>
/*noinspection CssUnusedSymbol*/
.content.collapsed {
	display: none;
}

.ContainerElement {
	overflow: auto;
	padding: 5px;
}

.content-holder {
	width: 100%;
}

.middle {
	display: flex;
}

.top.buttons, .bottom.buttons {
	padding: .25em 0;
}

.left.buttons, .right.buttons {
	width: 1em;
	padding: 0 .5em;
}

.content {
	flex: 1;
	text-align: left;
	overflow-wrap: anywhere;
	overflow-y: auto;
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