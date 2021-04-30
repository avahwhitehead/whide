<template>
	<div>
		<div ref="popup-el" class="tree-popover-container" :class="{'hidden': !show_popup}">
			<FontAwesomeIcon icon="external-link-alt" class="open-window-button" @click="openTreeInViewer" />

			<FontAwesomeIcon icon="times-circle" class="close-button" @click="show_popup = false" />

			<PopupTreeViewerBody :tree="text" class="tooltip-content" />

			<div class="arrow" data-popper-arrow />
		</div>

		<span
			ref="popup-target"
			class="highlight popcorn"
			v-text="text"
			@click="show_popup = !show_popup"
			@click.middle="openTreeInViewer"
			@dblclick="openTreeInViewer"
		/>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import PopupTreeViewerBody from "@/components/TreePopupBody.vue";
import { createPopper } from '@popperjs/core';
import { library } from "@fortawesome/fontawesome-svg-core";
import { faTimesCircle } from '@fortawesome/free-solid-svg-icons';
import { FontAwesomeIcon } from "@fortawesome/vue-fontawesome";
library.add(faTimesCircle);

interface DataTypeDescriptor {
	show_popup: boolean;
}

export default Vue.extend({
	name: 'OutputTreeString',
	components: {
		FontAwesomeIcon,
		PopupTreeViewerBody,
	},
	props: {
		text: String,
	},
	data(): DataTypeDescriptor {
		return {
			show_popup: false,
		};
	},
	mounted() {
		//Link the popup and the tree text
		createPopper(this.$refs["popup-target"] as HTMLElement, this.$refs["popup-el"] as HTMLElement, {
			placement: 'top',
			modifiers: [
				{
					name: 'offset',
					options: {
						offset: [0, 8],
					},
				},
			],
		});
	},
	methods: {
		openTreeInViewer(): void {
			//Open the tree in a tree viewer in a new window
			//TODO: Send the conversion string as well
			let routeData = this.$router.resolve({ path: '/trees', query: { t: this.text } });
			window.open(routeData.href, '_blank');
		}
	}
})
</script>


<style scoped>
.highlight:hover {
	text-decoration: underline;
	cursor: pointer;
}

.hidden {
	display: none;
}

.close-button, .open-window-button {
	width: 1.25em;
	height: 1.25em;
}
.open-window-button {
	float: left;
}
.close-button {
	text-align: right;
	float: right;
	color: red;
}
.open-window-button:hover, .close-button:hover {
	cursor: pointer;
}

/*
Popover CSS adapted from the Popper.js tutorial:
https://popper.js.org/docs/v2/tutorial/
*/

.tree-popover-container {
	z-index: 9000;
	background: #F5F5F5;
	padding: 5px;
	border-radius: 5px;
	width: 400px;
	min-width: fit-content;
	min-height: fit-content;
}

.arrow, .arrow::before {
	position: absolute;
	width: 30px;
	height: 30px;
	background: inherit;
}

.arrow {
	visibility: hidden;
}

.arrow::before {
	visibility: visible;
	content: '';
	transform: rotate(45deg);
}

.tree-popover-container[data-popper-placement^='top'] > .arrow {
	bottom: -4px;
}

.tree-popover-container[data-popper-placement^='bottom'] > .arrow {
	top: -4px;
}

.tree-popover-container[data-popper-placement^='left'] > .arrow {
	right: -4px;
}

.tree-popover-container[data-popper-placement^='right'] > .arrow {
	left: -4px;
}
</style>
