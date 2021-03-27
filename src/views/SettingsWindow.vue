<template>
	<div class="settings-window">
		<div class="wrapper">
			<div class="pages-list">
				<div
					v-for="(page,i) of pages" :key="i"
					@click="current_page = page"
					class="page"
					:class="{'current': current_page === page}"
				>
					<span v-text="page.name" />
				</div>
			</div>

			<div class="page-content">
				<div v-if="current_page">
					<div class="header-info">
						<h1 v-text="current_page.name" style="text-decoration: underline" />
						<p v-text="current_page.description || 'No description provided.'" />
						<p>Provided by <span v-text="current_page.plugin || 'not specified'" style="text-decoration: underline; font-style: italic" />.</p>
					</div>
					<hr />
					<InputGroup :elements="current_page.settings" />
				</div>
			</div>
		</div>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import InputGroup from "@/components/InputGroup.vue";
import { InputElementDescriptor } from "@/components/InputElement.vue";

interface PageInfo {
	//The page name
	name: string;
	//Some text to display at the top of the page
	description?: string;
	//Array to build the settings page from
	settings: InputElementDescriptor[];
	//The plugin providing this page
	plugin?: string;
}

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	current_page: PageInfo|undefined;
}

export default Vue.extend({
	name: 'TreeWindow',
	components: {
		InputGroup,
	},
	data() : DataTypesDescriptor {
		return {
			current_page: undefined,
		}
	},
	computed: {
		pages() : PageInfo[] {
			//TODO: Get this from plugins
			return [
				{
					name: "General",
					settings: [
						"This is the 'general' page",
						{
							name: "First Name",
							type: "string",
							description: "Your forename"
						},
						{
							name: "Last Name",
							type: "string",
							description: "Your surname"
						},
					]
				},
				{
					name: "Appearance",
					settings: [
						"This is the 'appearance' page",
					]
				},
				{
					name: "HWhile",
					settings: [
						"This is the 'hwhile' page",
						{
							name: "Path to HWhile",
							type: "file",
							description: "Path to the HWhile executable"
						}
					]
				},
			];
		}
	},
	mounted() {
		this.current_page = this.pages[0];
	},
});
</script>

<style scoped>
.settings-window {
	display: flex;
	flex-direction: column;
	flex: 1;

	text-align: left;
}
.wrapper {
	display: flex;
	flex-direction: row;
	flex: 1;
}

.pages-list {
	width: 15%;
	border-right: 1px solid black;
	float: left;
}

.pages-list .page {
	user-select: none;
	padding: 5px;
}

.pages-list .page:hover {
	cursor: pointer;
}

/*noinspection CssUnusedSymbol*/
.pages-list .page.current {
	background-color: lightgrey;
}

.page-content {
	flex: 1;
	width: 75%;
}

.header-info {
	margin: 0 5px;
}
</style>