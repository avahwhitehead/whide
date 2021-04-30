<template>
	<div>
		<div ref="popup-el" class="tree-popover-container" :class="{'hidden': !show_popup}">
			<PopupTreeViewerBody
				:tree="text"
				class="tooltip-content"
				@viewerReq="openTreeInViewer"
				@closeReq="show_popup=false"
				@converter="onConverterChange"
				@change="onChange"
			/>

			<div class="arrow" />
		</div>

		<span
			ref="popup-target"
			class="highlight"
			v-text="displayText"
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

interface DataTypeDescriptor {
	show_popup: boolean;
	converter: string;
	converted: string;
	displayText: string;
}

export default Vue.extend({
	name: 'OutputTreeString',
	components: {
		PopupTreeViewerBody,
	},
	props: {
		text: String,
	},
	data(): DataTypeDescriptor {
		return {
			show_popup: false,
			converted: '',
			converter: '',
			displayText: this.text,
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
			let routeData = this.$router.resolve({ path: '/trees', query: { t: this.text, c: this.converter } });
			window.open(routeData.href, '_blank');
		},
		onConverterChange(converter: string) {
			this.converter = converter;
		},
		onChange(converted: string) {
			this.converted = converted;
		},
	},
	watch: {
		show_popup(visible: boolean) {
			if (!visible) this.displayText = this.converted;
		}
	}
})
</script>


<style scoped>
.highlight {
	font-weight: bold;
}
.highlight:hover {
	text-decoration: underline;
	cursor: pointer;
}

.hidden {
	display: none;
}

/*
Popover CSS adapted from the Popper.js tutorial:
https://popper.js.org/docs/v2/tutorial/
*/

.tree-popover-container {
	z-index: 9000;
	background: #F5F5F5;
	padding: 5px 5px 15px;
	border-radius: 5px;
	width: 400px;
}

.arrow, .arrow::before {
	position: absolute;
	bottom: -5px;
	width: 20px;
	height: 20px;
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
