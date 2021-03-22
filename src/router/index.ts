import Vue from 'vue';
import VueRouter from 'vue-router';
import { RouteConfig } from "vue-router/types/router";
//Views
import EditorWindow from "@/views/Editor.vue";
import TreeWindow from "@/views/TreeWindow.vue";

//Use the router
Vue.use(VueRouter);

//Route definitions
const routes : RouteConfig[] = [
	{ path: '/', component: EditorWindow },
	{ path: '/trees', component: TreeWindow }
];

//Create the router
const router : VueRouter = new VueRouter({
	routes,
	//Use '/path' instead of '/#/path'
	mode: "history",
});
//Load the first page (important when running in electron)
router.push('/');
//Export the router
export default router;