<template>
	<div id="app">
		<router-view></router-view>
	</div>
</template>

<script lang="ts">
import Vue from "vue";

export default Vue.extend({
	name: 'app',
});
</script>

<!--suppress CssUnusedSymbol -->
<style>
@import "../styles/v-tooltip.css";

#app {
	font-family: Avenir, Helvetica, Arial, sans-serif;
	-webkit-font-smoothing: antialiased;
	-moz-osx-font-smoothing: grayscale;
	text-align: center;
	color: #2c3e50;
}

#app {
	display: flex;
	flex-direction: column;

	height: 100%;
	width: 100%;
	position: absolute;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
}

#nav {
	padding: 30px;
}

#nav a {
	font-weight: bold;
	color: #2c3e50;
}

#nav a.router-link-exact-active {
	color: #42b983;
}
</style>