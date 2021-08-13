<template>
	<span>
		<v-menu
			v-if="segment.isTree"
			v-model="show_popup"
			:close-on-content-click="false"
			offset-x
			offset-y
		>
			<template v-slot:activator="{ on, attrs }">
				<span>
					<span
						class="tree-text"
						v-bind="attrs"
						v-on="on"
						v-text="text"
						:title="segment.content"
						@click.middle="openTreeInViewer"
						@dblclick="openTreeInViewer"
					/>
					<FontAwesomeIcon
						v-if="showConverted"
						icon="undo"
						class="revert-icon"
						title="Revert"
						@click="onRevertClick"
					/>
				</span>
			</template>

			<PopupTreeViewerBody
				v-model="show_popup"
				:tree="segment.content"
				ref="popup-viewer"
				class="popup-card"
				@change="onChange"
			/>
		</v-menu>

		<span
			v-else
			v-text="segment.content"
		/>
	</span>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";
import PopupTreeViewerBody from "@/components/TreePopupBody.vue";

interface DataTypeDescriptor {
	show_popup: boolean;
	showConverted: boolean;
	converted: string;
	conversionString: string;
	displayText: string;
}

type Segment = {
	content: string,
	isTree: boolean,
};

export default Vue.extend({
	name: 'OutputTreeString',
	components: {
		PopupTreeViewerBody,
	},
	props: {
		segment: {
			type: Object as PropType<Segment>,
			required: true,
		},
	},
	data(): DataTypeDescriptor {
		return {
			show_popup: false,
			displayText: this.segment.content,
			showConverted: false,
			converted: '',
			conversionString: '',
		};
	},
	computed: {
		text(): string {
			if (this.showConverted) {
				return this.converted;
			}
			return this.segment.content;
		}
	},
	methods: {
		openTreeInViewer(): void {
			//Open the tree in a tree viewer in a new window
			let routeData = this.$router.resolve({
				path: '/trees',
				query: {
					t: this.segment.content,
					c: this.conversionString
				}
			});
			window.open(routeData.href, '_blank');
		},
		onChange(converted: string, conversionString: string) {
			this.converted = converted;
			this.conversionString = conversionString;
			this.showConverted = true;
		},
		onRevertClick(): void {
			this.showConverted = false;
		},
	},
})
</script>


<style scoped>
.tree-text {
	font-weight: bold;
}
.tree-text:hover {
	text-decoration: underline;
}

.popup-card {
	width: 32em;
	height: auto;
}

.revert-icon {
	height: .8em;
	vertical-align: middle;
}
.revert-icon:hover {
	cursor: pointer;
}
</style>
