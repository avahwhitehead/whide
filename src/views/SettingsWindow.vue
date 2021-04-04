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
				<code v-if="settingValues" v-text="settingValues"></code>
				<div>
					<button @click="btnResetClick">Reset</button>
					<button @click="btnSaveClick">Save</button>
				</div>
			</div>
		</div>
	</div>
</template>


<script lang="ts">
import Vue from "vue";
import InputGroup from "@/components/InputGroup.vue";
import { InputElementDescriptor } from "@/components/InputElement.vue";
import { pluginManager } from "@/utils/globals";
import { PluginInfo } from "@/api/PluginInfo";
import { SettingsItem } from "@whide/whide-types";
import { CustomDict } from "@/types/CustomDict";

interface PageInfo {
	//The page name
	name: string;
	//Some text to display at the top of the page
	description?: string;
	//Array to build the settings page from
	settings: InputElementDescriptor[];
	//The plugin providing this page
	plugin?: PluginInfo;
}

function settingToInputDescriptor(setting: SettingsItem) : InputElementDescriptor {
	if (typeof setting === 'string') return setting;

	return {
		description: setting.description,
		default: setting.default,
		name: setting.name,
		id: setting.id,
		placeholder: setting.placeholder,
		type: setting.type,
		validator: setting.validator,
	};
}

/**
 * Type declaration for the data() values
 */
interface DataTypesDescriptor {
	current_page?: PageInfo;
	settingValues?: CustomDict<string|undefined>;
}

export default Vue.extend({
	name: 'TreeWindow',
	components: {
		InputGroup,
	},
	data() : DataTypesDescriptor {
		return {
			current_page: undefined,
			settingValues: undefined,
		};
	},
	computed: {
		pages() : PageInfo[] {
			return pluginManager.getPlugins().map((p: PluginInfo) => {
				return {
					name: p.name,
					description: p.description,
					plugin: p,
					settings: p.settings.map(s => settingToInputDescriptor(s)),
				};
			});
		}
	},
	mounted() {
		this.current_page = this.pages[0];
	},
	methods: {
		onInputValueChange(id: string, value?: string) {
			// if (this.current_page && this.current_page.plugin) {
				// this.current_page.plugin.settingValues[id] = value;
			// }
			if (this.settingValues) this.settingValues[id] = value;
		},
		btnResetClick() {
			if (!this.current_page || !this.current_page.plugin) return;
			this.settingValues = this.current_page.plugin.makeSettingsObj();
			// this.current_page.plugin.resetSettings().then(() => {
				console.log(`Settings reset`);
			// });
		},
		btnSaveClick() {
			//Do nothing if there isn't anything to save
			if (!this.current_page || !this.current_page.plugin || !this.settingValues) return;
			//Save the settings
			this.current_page.plugin.saveSettingsObj(this.settingValues).then(() => {
				console.log(`Settings saved`);
			});
		},
	},
	watch: {
		current_page(page?: PageInfo) {
			//Get a new settings object for the new page
			if (!page || !page.plugin) this.settingValues = undefined;
			else this.settingValues = page.plugin.makeSettingsObj();
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

span.plugin-name {
	text-decoration: underline;
	font-style: italic;
}
</style>