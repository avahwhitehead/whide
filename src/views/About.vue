<template>
	<v-container class="about-page">
		<h2>Whide: The WHILE IDE</h2>

		<p class="mb-1"><i>Version: {{ version }}</i></p>

		<v-divider class="mb-2" />

		<p>For information and help, see the <a href="https://github.com/sonrad10/Whide">project homepage</a> on GitHub.</p>

		<v-divider />

		<div class="copyright">
			<p class="ma-0">&copy; 2020 - {{ thisYear}} sonrad10; <a :href="license">MIT License</a>.</p>
			<p class="ma-0">3rd party libraries are listed in the <a :href="packageJson">package.json</a> file.</p>
		</div>
	</v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { version } from "../../package.json";

interface DataTypeInterface {
	license: string;
	packageJson: string;
}

export default Vue.extend({
	name: 'AboutWindow',
	data() : DataTypeInterface {
		return {
			license: 'https://github.com/sonrad10/Whide/blob/master/LICENSE.md',
			packageJson: 'https://github.com/sonrad10/Whide/blob/master/package.json',
		}
	},
	computed: {
		thisYear(): string {
			return ((new Date()).getFullYear() + 1).toString();
		},
		version(): string {
			return version;
		},
	},
});
</script>

<style scoped>
.about-page {
	text-align: left;
}

.copyright {
	font-size: small;
	text-align: center;
}
</style>
