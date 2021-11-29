<template>
	<div class="pa-0 ma-0 fill-page">
		<v-navigation-drawer permanent app class="nav-drawer" width="180px" v-model="showSelectPanel">
			<div class="pa-0">
				<v-btn depressed @click="createConfig" title="Create new run configuration" >
					<FontAwesomeIcon icon="plus"/>
				</v-btn>
			</div>
			<v-list dense>
				<v-list-item-group v-model="configIndex" mandatory>
					<v-list-item v-for="(config, i) in runConfigs" :key="i">
						<v-list-item-content>
							<v-list-item-title v-text="config.name" />
						</v-list-item-content>
					</v-list-item>
				</v-list-item-group>
			</v-list>
		</v-navigation-drawer>

		<RunConfigForm v-model="configIndex" style="width: 100%; max-width: 100%;" />
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import RunConfigForm from "@/components/RunConfigEditor.vue";
import { INTERPRETERS, RunConfiguration } from "@/types/RunConfiguration";
import { FileInfoState } from "@/types/FileInfoState";
import path from "path";

type DataTypeInterface = {
	configIndex: number,
};

export default Vue.extend({
	name: 'RunConfigWindow',
	components: {
		RunConfigForm,
	},
	data() : DataTypeInterface {
		return {
			configIndex: -1,
		}
	},
	mounted() {
		this.showSelectPanel = true;
		if (this.runConfigs.length === 0) this.createConfig();
	},
	computed: {
		runConfigs(): RunConfiguration[] {
			return this.$store.state.runConfigurations;
		},
		//Force the select panel to always be visible
		showSelectPanel: {
			get(): boolean { return true; },
			set() { /*Do nothing*/ }
		},
	},
	methods: {
		createConfig() {
			const openFile: FileInfoState|undefined = (this.$store.state.focusedFile >= 0)
				? this.$store.state.openFiles[this.$store.state.focusedFile]
				: undefined;

			let newConfig: RunConfiguration = {
				name: openFile ? path.basename(openFile.path) : 'Unnamed',
				file: openFile ? openFile.path : '',
				input: 'nil',
				outputFormat: 'any',
				interpreter: INTERPRETERS.HWHILE,
			}
			this.$store.commit('addRunConfig', newConfig);
			this.configIndex = this.runConfigs.indexOf(newConfig);
		},
	},
});
</script>

<style scoped>
.fill-page {
	width: 100%;
	height: 100%;
}
</style>
