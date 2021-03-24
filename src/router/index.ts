import Vue from 'vue';
import VueRouter from 'vue-router';
import { RouteConfig } from "vue-router/types/router";
//Views
import EditorWindow from "@/views/Editor.vue";
import TreeWindow from "@/views/TreeWindow.vue";
import { isElectron } from "@/utils/globals";

//Use the router
Vue.use(VueRouter);

//Route definitions
const routes : RouteConfig[] = [
	{ path: '/', component: EditorWindow },
	{ path: '/trees', component: TreeWindow }
];

//Create the router
const router : VueRouter = new VueRouter({
	//Use '/path' in the browser. Use hash ('/#/path') in electron
	mode: isElectron ? 'hash' : 'history',
	routes,
});
//Export the router
export default router;