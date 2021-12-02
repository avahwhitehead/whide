import Vue from 'vue';
import VueRouter from 'vue-router';
import { RouteConfig } from "vue-router/types/router";
//Views
import EditorWindow from "@/views/Editor.vue";
import TreeWindow from "@/views/TreeWindow.vue";
import SettingsWindow from "@/views/SettingsWindow.vue";
import RunConfigWindow from "@/views/RunConfigWindow.vue";
import AboutWindow from "@/views/About.vue";

//Use the router
Vue.use(VueRouter);

//Route definitions
const routes : RouteConfig[] = [
	{ path: '/', component: EditorWindow },
	{ path: '/about', component: AboutWindow },
	{ path: '/trees', component: TreeWindow },
	{ path: '/settings', component: SettingsWindow },
	{ path: '/configurations', component: RunConfigWindow },
];

//Create the router
const router : VueRouter = new VueRouter({
	//Use '/path' in the browser. Use hash ('/#/path') in electron
	mode: 'hash',
	routes,
});
//Export the router
export default router;