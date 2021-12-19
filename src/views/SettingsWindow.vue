<template>
	<div style="height: 100%; display: flex; flex-direction: column">
		<SettingsElement style="flex: 1" />

		<v-divider />

		<div style="flex: 0">* {{ settingsText }} are saved automatically</div>
	</div>
</template>

<script lang="ts">
import Vue from "vue";
import SettingsElement from "@/components/SettingsElement.vue";

interface DataTypeDescriptor {
	settingsText: string;
}

export default Vue.extend({
	name: 'SettingsWindow',
	components: {
		SettingsElement,
	},
	data(): DataTypeDescriptor {
		return {
			settingsText: this.$store.state.isMac ? 'Preferences' : 'Settings'
		};
	},
})
</script>


<style scoped>
.SettingsWindow {

}
</style>
