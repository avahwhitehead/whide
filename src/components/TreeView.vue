<template>
	<div class="TreeView full-width">
		<v-container
			v-for="(item, i) in filteredItems" :key="item[idKey]"
			class="TreeNode full-width pl-0 pr-0"
			:class="{
				'pt-1': dense,
				'pb-1': dense,
			}"
		>
			<div class="TreeNodeContent" :class="{ 'unselectable': !selectable, 'dark': isDarkTheme }" @click="onItemClick(item)">
				<span class="pl-1" v-if="item[childrenKey]">
					<span v-if="openItems[i]" @click.stop="closeTree(item)">
						<slot name="on-icon">
							<v-icon>fa-caret-down</v-icon>
						</slot>
					</span>
					<span v-else @click.stop="openTree(item)">
						<slot name="off-icon">
							<v-icon>fa-caret-right</v-icon>
						</slot>
					</span>
				</span>

				<span class="pl-1" v-if="hasPrependSlot">
					<slot name="prepend" :item="item" :open="openItems[i]" />
				</span>

				<span class="pl-1">{{ item[textKey] }}</span>
			</div>

			<div v-if="item[childrenKey] && openItems[i]" class="TreeChildren pl-5 full-width">
				<TreeView
					v-bind="$props"
					:items="item[childrenKey]"
					class="pl-2"
					@click="onItemClick"
				>
					<template v-for="(_,name) in $scopedSlots" :slot="name" slot-scope="slotData">
						<slot :name="name" v-bind="slotData" />
					</template>
				</TreeView>
			</div>
		</v-container>
	</div>
</template>

<script lang="ts">
import Vue, { PropType } from "vue";

interface DataTypeDescriptor {

}

export default Vue.extend({
	name: 'TreeView',
	components: {

	},
	props: {
		items: Array as PropType<Array<any>>,
		idKey: {
			type: String,
			default: 'id',
		},
		textKey: {
			type: String,
			default: 'label',
		},
		childrenKey: {
			type: String,
			default: 'children',
		},
		open: {
			type: Array as PropType<Array<any>>,
			default: () => [],
		},
		excluded: {
			type: Array as PropType<Array<any>>,
			default: () => [],
		},
		dense: {
			type: Boolean,
			default: false,
		},
		selectable: {
			type: Boolean,
			default: false,
		},
		loadChildren: {
			type: Function as PropType<(item: any) => void|Promise<void>>,
			required: false,
		},
		search: {
			type: String,
			default: '',
		},
		keepEmptyParent: {
			type: Boolean,
			default: false,
		},
	},
	data(): DataTypeDescriptor {
		return {};
	},
	computed: {
		hasPrependSlot(): boolean {
			return !!this.$scopedSlots['prepend'];
		},
		openItems(): boolean[] {
			const items = this.filteredItems || [];
			return items.map(e => this.open.includes(e) || false);
		},
		filteredItems(): any[] {
			return this.items.filter(item => !this.shouldExcludeItem(item));
		},
		isDarkTheme(): boolean {
			return this.$vuetify.theme.dark;
		},
	},
	methods: {
		openTree(item: any): void {
			const index: number|undefined = this.open.indexOf(item);
			if (index === -1) this.open.push(item);

			if (this.loadChildren) {
				this.loadChildren(item);
			}
		},
		closeTree(item: any): void {
			const index: number|undefined = this.open.indexOf(item);
			if (index < -1) return;
			this.open.splice(index, 1);
		},

		shouldExcludeItem(item: any): boolean {
			if (!this.search) return false;

			if ((item[this.textKey]).includes(this.search)) {
				return false;
			}
			const children: any[]|undefined = item[this.childrenKey];
			if (children) {
				if (this.keepEmptyParent) return false;
				return children.filter(c => !this.shouldExcludeItem(c)).length > 0;
			}
			return true;
		},

		onItemClick(item: any) {
			this.$emit('click', item);
		},
	},
	watch: {
		openItems() {
			this.$emit('update:open', this.open);
		},
		excludedItems() {
			this.$emit('update:excluded', this.excluded);
		},
	},
})
</script>


<style scoped>
.TreeView {
	overflow-x: auto;
	text-align: left
}

.TreeNodeContent {
	white-space: nowrap;
}
.TreeNodeContent:hover {
	background-color: #F0F0F0;
}
.TreeNodeContent.dark:hover {
	background-color: #444444;
}

.TreeNode > .TreeChildren > .TreeView {
	overflow-x: visible;
}

.unselectable {
	user-select: none;
}

.full-width {
	width: 100%;
}
</style>
