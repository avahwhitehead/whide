<template>
	<div class="VariableTable">
		<v-data-table
			:headers="headers"
			:items="variables"
			hide-default-footer
			dense
			disable-filtering
			:items-per-page="30"
			no-data-text="No variables to show"
			@dblclick:row="onRowDblClick"
		>
			<template v-slot:item.actions="{ item }">
				<v-btn
					icon
					title="Edit"
					:disabled="disabled"
				>
					<FontAwesomeIcon
						icon="pencil-alt"
						@click="onEditClick(item)"
						class="ml-2 mr-2 action-icon"
					/>
				</v-btn>
				<v-btn
					icon
					title="Open in tree viewer"
				>
					<FontAwesomeIcon
						icon="eye"
						@click="openTree(item)"
						class="ml-2 mr-2 action-icon"

					/>
				</v-btn>
			</template>

			<template v-slot:item.value="{ item }">
				<div
					class="text-truncate pa-0"
					style="max-width: 200px;"
					v-text="item.value"
				/>
			</template>
		</v-data-table>

		<VariableEditorPopup
			v-model="showVariableEditor"
			:name="editVariable.name"
			:tree="editVariable.tree"
			:format="editVariable.type"
			@change="onVariableEdit"
		/>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import VariableEditorPopup from "@/components/VariableEditorPopup.vue";
import { BinaryTree } from "whilejs";
import { DataTableHeader, DataTableItemProps } from "vuetify";

export interface VariableDisplayType {
	program: string;
	name: string;
	value: string;
	type: string;
	tree: BinaryTree;
}

interface DataTypeDescriptor {
	showVariableEditor: boolean;
	editVariable: VariableDisplayType;
}

type DataTableItemEvent = DataTableItemProps & { item: VariableDisplayType };

export default Vue.extend({
	name: 'VariableTable',
	components: {
		VariableEditorPopup,
	},
	props: {
		variables: {
			type: Array as () => Array<VariableDisplayType>,
			required: true,
		},
		showProgramCol: {
			type: Boolean,
			default: true,
		},
		disabled: {
			type: Boolean,
			default: false,
		}
	},
	data(): DataTypeDescriptor {
		return {
			showVariableEditor: false,
			editVariable: {
				program: '',
				name: '',
				type: '',
				value: '',
				tree: null,
			},
		};
	},
	computed: {
		headers(): DataTableHeader[] {
			//The headers for all fixed columns
			let headers = [
				{text: 'Name', value: 'name'},
				{text: 'Value', value: 'value', sortable: false},
				{text: 'Type', value: 'type', sortable: false},
				{text: 'Actions', value: 'actions', sortable: false},
			];
			//Only add the program column if requested
			if (this.showProgramCol) {
				headers.splice(0, 0, {text: 'Program', value: 'program'});
			}
			//Return the headers
			return headers;
		}
	},
	methods: {
		onEditClick(variable: VariableDisplayType): void {
			this.showVariableEditor = true;
			this.editVariable = { ...variable };
		},
		openTree(variable: VariableDisplayType): void {
			let routeData = this.$router.resolve({
				path: '/trees',
				params: {
					t: variable.value,
					c: variable.type,
				}
			});
			window.open(routeData.href, '_blank');
		},
		onRowDblClick(event: MouseEvent, info: DataTableItemEvent) {
			if (this.disabled) return;
			this.onEditClick(info.item);
		},
		/**
		 * Handle the user saving a new variable value
		 * @param tree              The new value of the variable
		 * @param conversionString  The new conversion string
		 */
		onVariableEdit(tree: BinaryTree, conversionString: string) {
			//Pass the event up the stack so it can be accessed
			this.$emit('change', this.editVariable.name, tree, conversionString);
		},
	},
})
</script>

<style>
/*Remove padding on the table cells*/
.v-data-table>.v-data-table__wrapper>table>tbody>tr>td,
.v-data-table>.v-data-table__wrapper>table>tbody>tr>th,
.v-data-table>.v-data-table__wrapper>table>tfoot>tr>td,
.v-data-table>.v-data-table__wrapper>table>tfoot>tr>th,
.v-data-table>.v-data-table__wrapper>table>thead>tr>td,
.v-data-table>.v-data-table__wrapper>table>thead>tr>th {
	padding: 0 !important;
}
</style>

<style scoped>
.action-icon:hover {
	cursor: pointer;
}
</style>
