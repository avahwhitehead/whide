<template>
	<v-col>
		<v-card-title class="pa-0">
			<span class="text-h5">General</span>
		</v-card-title>

		<v-container>
			<v-form>
				<v-text-field
					v-model="hwhilePath"
					label="Path to HWhile"
					class="ma-0 pa-0"
					required
				/>
			</v-form>
		</v-container>
	</v-col>
</template>

<script lang="ts">
import Vue from "vue";

interface DataTypeInterface {

}

export default Vue.extend({
	name: 'SettingsGeneralPage',
	components: {

	},
	props: {

	},
	data() : DataTypeInterface {
		return {

		}
	},
	computed: {
		hwhilePath: {
			get(): string {
				return this.$store.state.settings.general.hwhilePath;
			},
			set(hwhilePath: string): void {
				this.$store.commit('setHWhilePath', hwhilePath);
			}
		}
	},
});
</script>


<style scoped>

</style>
