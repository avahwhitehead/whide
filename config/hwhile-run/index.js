import * as run from "./run.js";

export const menus = [
	{
		"name": "Run",
		"children": [
			{ "name": "Run", "command": "run_code" },
			{ "name": "Debug", "command": "run_code" }
		]
	}
];

export default [
	run
];