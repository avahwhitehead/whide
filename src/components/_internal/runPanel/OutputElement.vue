<template>
	<code class="OutputElement">
		<span
			v-for="(segment, i) of splitContent" :key="i"
			:class="{'highlight': segment.isTree}"
			@click="onSegmentClick(segment)"
			v-text="segment.content"
		/>
	</code>
</template>

<script lang="ts">
import Vue from "vue";

type Segment = {
	content: string,
	isTree: boolean,
};

interface DataTypeDescriptor {

}

function getTreeSegments(str: string) : Segment[] {
	let res : Segment[] = [];
	//Iterate over each segment of the string which matches the tree regex
	let matchArray : RegExpExecArray|null;
	while ((matchArray = /(?:[<>.]|nil)+/.exec(str)) !== null) {
		//Add any text before the start of the tree as a non-tree segment
		const before = str.substring(0, matchArray.index);
		if (before) res.push({content: before, isTree: false});

		//Remove everything from the string up to the end of the tree
		str = str.substr(matchArray.index + matchArray[0].length);

		//Add the tree to the result array
		res.push({content: matchArray[0], isTree: true});
	}
	//Add any text after the final tree match as a non-tree segment
	if (str) res.push({content: str, isTree: false});
	//Return the segments
	return res;
}

export default Vue.extend({
	name: 'OutputElement',
	components: {},
	props: {
		value: String,
	},
	data(): DataTypeDescriptor {
		return {}
	},
	computed: {
		splitContent() : Segment[] {
			return getTreeSegments(this.value);
		},
	},
	methods: {
		onSegmentClick(segment: Segment) {
			if (!segment.isTree) return;
			//Open the tree in a tree viewer
			window.open('/trees?t=' + segment.content, '_blank', "height=400");
		},
	},
	updated() {
		this.$nextTick(() => {
			//Scroll to the last child element
			if (this.$el.lastElementChild) {
				this.$el.lastElementChild.scrollIntoView();
			}
		});
	},
})
</script>


<!--suppress CssUnusedSymbol -->
<style scoped>
.OutputElement {
	white-space: pre-wrap;
	max-width: 100%;
}

.OutputElement span.highlight:hover {
	text-decoration: underline;
}
</style>
