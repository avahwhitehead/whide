<template>
	<div class="pluginToggler">
		<table>
			<thead>
				<tr>
					<th class="min-width">Enabled</th>
					<th class="max-width border">Name</th>
				</tr>
			</thead>
			<tbody>
				<tr v-for="(plugin,i) in plugins" :key="i">
					<td class="toggle-cell min-width">
						<input type="checkbox" :disabled="!plugin.isExternal" :checked="!plugin.disabled" @change="togglePlugin($event, plugin)"/>
					</td>
					<td class="name-cell max-width border" :title="plugin.isExternal ? plugin.filePath : 'System'">{{plugin.name}}</td>
				</tr>
			</tbody>
		</table>
	</div>
</template>

<script lang="ts">
import vue from "vue";
import { pluginManager } from "@/utils/globals";
import { PluginInfo } from "@/api/types/PluginInfo";

export default vue.extend({
	name: 'PluginToggler',
	computed: {
		plugins() : PluginInfo[] {
			if (!pluginManager) return [];
			return pluginManager.getPlugins();
		}
	},
	methods: {
		togglePlugin(event : Event, plugin: PluginInfo) : void {
			if (!plugin) return;
			try {
				if (plugin.disabled) pluginManager.enablePlugin(plugin);
				else pluginManager.disablePlugin(plugin);
			} catch (e) {
				console.error(e);
			}
			//Update the combobox value
			(event.target as HTMLInputElement).checked = !plugin.disabled;
			console.log(`Plugin ${plugin.name} is ${plugin.disabled ? 'dis' : 'en'}abled`)
		}
	}
})
</script>


<style scoped>
.pluginToggler {
	text-align: left;
}

table {
	/* Table fills the space */
	width: 100%;
	/* Borders should touch */
	border-spacing: 0;
}

table .min-width {
	/* Set the checkbox cell to the minimum width */
	white-space: nowrap;
}

table .max-width {
	/* Name cell fills remaining width */
	width: 99%;
}

table thead th {
	text-align: left;
	/* Border under the headers */
	border-bottom: 1px solid black;
}

table .border {
	/* Border between the columns */
	border-left: 1px solid black;
}

table .toggle-cell {
	text-align: center;
}

table .name-cell {
	text-align: left;
}
</style>
