<template>
	<v-container class="text-left">
		<h1>Privacy Policy</h1>

		<p class="mb-0">
			In the context of this document, there are two distributions of Whide (described below.
			Where a specific distribution is not specified or implied, it may be assumed that the information refers to both distributions.
		</p>
		<ul>
			<li>The "web application" ("webapp") - the app hosted on the internet, and accessed through the user's web browser</li>
			<li>The "desktop application" - the app installed, and executed, locally on the user's computer as a typical application</li>
		</ul>

		<v-divider />

		<h3>Information Collected and Stored</h3>

		<p>
			No personally identifying information about this app's users, or the devices used to access this app,
			is collected, stored, or analysed.
		</p>
		<p>
			Only information necessary for the functionality of this app is stored;
			this includes, but is not limited to, user preferences and information required to maintain the
			application state.
		</p>
		<p>
			In the webapp, data representing a virtual file system is also stored, in order to provide the user with
			an in-browser experience similar to that of the desktop app.
		</p>

		<h3>Storage of Data</h3>

		<p>All information and data stored by this application is stored exclusively and entirely on the user's computer using
			cookies,
			<a href="https://developer.mozilla.org/en-US/docs/Web/API/Window/localStorage">local storage</a>,
			and
			<a href="https://developer.mozilla.org/en-US/docs/Web/API/IndexedDB_API">indexedDB</a>.
		</p>

		<p>
			At no point does any information leave the local computer.
		</p>

		<h3>Advertisement and Other Third Parties</h3>

		<p>This app does not contain any advertising or other third party scripts.</p>

		<p>
			This app includes some links in this app which lead to external sites.
			The privacy policies of these websites may differ significantly from this one, and are completely independent of this site.
		</p>

		<h3>Changes To This Privacy Policy</h3>

		<p>
			This Privacy Policy is effective as of December 2021 and will remain in until it is replaced by a future version,
			at which point that policy will take effect immediately.
		</p>

		<p>
			The right is reserved to update or change this privacy policy at any time, and you should check this Privacy Policy periodically.
			If any significant changes to this Privacy Policy are made, a prominent notice will be placed on this app.
		</p>

		<h3>Contact Information</h3>

		<p>For any questions or concerns regarding this privacy policy, please open an issue on the <a href="https://github.com/sonrad10/Whide/issues">GitHub repository</a>.</p>

		<v-divider />

		<div class="copyright">
			<p>
				This privacy policy is loosely based on a template provided on GitHub by <a href="https://github.com/ArthurGareginyan/privacy-policy-template" target="_blank" rel="noopener noreferrer">Arthur Gareginyan</a>.
				(Sourced 2021-12-02)
			</p>
		</div>
	</v-container>
</template>

<script lang="ts">
import Vue from "vue";

interface DataTypeInterface {

}

export default Vue.extend({
	name: 'PrivacyWindow',
	data() : DataTypeInterface {
		return {

		}
	},
	computed: {

	},
});
</script>

<style scoped>
.copyright {
	font-size: small;
}
</style>
