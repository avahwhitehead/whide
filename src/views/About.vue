<template>
	<v-container class="about-page">
		<h2>Whide: The WHILE IDE</h2>

		<p class="mb-1"><i>Version: {{ version }}</i></p>

		<v-divider class="mb-2" />

		<p>For information and help, see the <a href="https://github.com/sonrad10/Whide">project homepage</a> on GitHub.</p>

		<h3>Related projects:</h3>
		<div class="ml-2">
			<div v-for="(project, i) in projects" :key="i">
				<h4>
					<a v-if="project.url" :href="project.url" v-text="project.name" />
					<span v-else v-text="project.name" />
				</h4>

				<p v-if="project.description">{{ project.description }}</p>
			</div>
		</div>

		<v-divider />

		<div class="copyright">
			<p class="ma-0">&copy; 2020 - {{ thisYear}} sonrad10; <a :href="license">MIT License</a>.</p>
			<p class="ma-0">3rd party libraries are listed in the <a :href="packageJson">package.json</a> file.</p>
		</div>

		<v-dialog v-model="showPopup" max-width="600px">
			<v-card max-height="400px" style="overflow: hidden">
				<h1 class="rainbow-text justify-center my-title">
					Trans rights are human rights!
				</h1>
				<v-card-text class="ma-0 pa-0" style="overflow: hidden">
					<v-lazy>
						<img
							src="https://upload.wikimedia.org/wikipedia/commons/b/b0/Transgender_Pride_flag.svg"
							alt="Trans pride flag"
							style="max-height: 100%"
							title="egg lol"
						/>
					</v-lazy>
				</v-card-text>
			</v-card>
		</v-dialog>
	</v-container>
</template>

<script lang="ts">
import Vue from "vue";
import { version } from "../../package.json";

interface ProjectDescriptor {
	name: string;
	description?: string;
	url?: string;
}

interface DataTypeInterface {
	license: string;
	packageJson: string;
	projects: ProjectDescriptor[];
	showPopup: boolean;
	keyHistory: string[];
}

export default Vue.extend({
	name: 'AboutWindow',
	data() : DataTypeInterface {
		return {
			license: 'https://github.com/sonrad10/Whide/blob/master/LICENSE.md',
			packageJson: 'https://github.com/sonrad10/Whide/blob/master/package.json',
			showPopup: false,
			keyHistory: [],
			projects: [
				{
					name: 'HWhile',
					url: 'https://github.com/alexj136/,H,While',
					description: 'Primary interpreter and debugger for WHILE programs.',
				},
				{
					name: 'While.js',
					url: 'https://github.com/sonrad10/while.js',
					description: 'Secondary interpreter for WHILE programs, designed to be run in the browser.',
				},
				{
					name: 'TreeLang',
					url: 'https://github.com/sonrad10/whide-treeLang',
					description: 'Description language used to convert binary trees to a human-friendly format.',
				},
				{
					name: 'HWhile Wrapper',
					url: 'https://github.com/sonrad10/hwhile-wrapper',
					description: 'Wrapper around the HWhile interface to allow programmatic control.',
				},
			]
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
	mounted() {
		document.addEventListener('keypress', this.keyPress);
	},
	destroyed() {
		document.removeEventListener('keypress', this.keyPress);
	},
	methods: {
		keyPress(e: KeyboardEvent) {
			this.keyHistory.push(e.key);
			const text = this.keyHistory.join('');

			let found = 0;
			for (let keyword of ['trans', 'egg']) {
				if (text === keyword) {
					found = 2;
					break;
				} else if (text === keyword.substr(0, this.keyHistory.length)) {
					found = 1;
					break;
				}
			}

			if (found === 2) {
				this.showPopup = true;
				this.keyHistory = [];
			} else if (found === 0) {
				this.keyHistory = [e.key];
			}
		}
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

.my-title {
	font-size: 30px !important;
	font-weight: bold !important;
	overflow-wrap: break-word !important;
}

.rainbow-text {
	background-image: linear-gradient(to left, violet, indigo, blue, green, #F2E30C, orange, red);
	-webkit-background-clip: text;
	color: transparent;
}
</style>
