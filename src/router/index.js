import Vue from 'vue'
import VueRouter from 'vue-router'
import Editor from '../views/Editor.vue'

Vue.use(VueRouter)

const r = {
	'/': {
		name: 'Editor',
		component: Editor,
	},
}

//Convert the map to an array, with the key as the `path` value
const routes = Object.entries(r).map(
	([k, v]) => ({
		...v,
		path: k,
	})
);

const router = new VueRouter({
	mode: 'history',
	base: process.env.BASE_URL,
	routes
})

export default router;
