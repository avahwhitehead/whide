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
						<h3 v-text="current_page.name" />
						<p v-text="current_page.description" v-if="current_page.description" />
						<p v-if="current_page.plugin">
							Provided by
							<span class="plugin-name">{{ current_page.plugin.name }}</span>
							<span>&nbsp;({{ current_page.plugin.isExternal ? 'user' : 'system' }})</span>
							.
						</p>
						<p v-else>Provider plugin not specified.</p>
					</div>

					<hr />

					<InputGroup
						:elements="current_page.settings"
						@change="onInputValueChange"
					/>
				</div>
				<div>
					<button @click="btnResetClick">Reset</button>
					<button @click="btnSaveClick">Save</button>
				</div>
			</div>
		</div>

		<InputPrompt @controller="c => this.ioController = c" />
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import InputGroup from "@/components/InputGroup.vue";
import { InputElementDescriptor } from "@/components/InputElement.vue";
import { IOController } from "@whide/whide-types";
import { CustomDict } from "@/types/CustomDict";
import InputPrompt from "@/components/InputPrompt.vue";

interface PageInfo {
	//The page name
	name: string;
	//Some text to display at the top of the page
	description?: string;
	//Array to build the settings page from
	settings: InputElementDescriptor[];
}

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	current_page?: PageInfo;
	settingValues?: CustomDict<string|undefined>;
	ioController?: IOController;
}

export default Vue.extend({
	name: 'TreeWindow',
	components: {
		InputGroup,
		InputPrompt
	},
	data() : DataTypesDescriptor {
		return {
			current_page: undefined,
			settingValues: undefined,
		};
	},
	computed: {
		pages() : PageInfo[] {
			//TODO: Get the settings pages
			return [];
		}
	},
	mounted() {
		this.current_page = this.pages[0];
	},
	methods: {
		onInputValueChange(id: string, value?: string) {
			if (this.settingValues) this.settingValues[id] = value;
		},
		btnResetClick() {
			return;
		},
		btnSaveClick() {
			//Do nothing if there isn't anything to save
			return;
		},
	},
	watch: {
		current_page() {
			this.settingValues = undefined;
		}
	}
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

.header-info h3 {
	text-decoration: underline
}

span.plugin-name {
	text-decoration: underline;
	font-style: italic;
}
</style>