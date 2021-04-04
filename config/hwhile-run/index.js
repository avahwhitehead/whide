const run = require("./run.js");
const debug = require("./debug.js");

module.exports.settings = [
	{
		name: "HWhile Path",
		id: "hwhile-path",
		type: "file",
		description: "Path to the Hwhile executable",
		default: 'hwhile',
	}
];

module.exports.menus = [
	{
		"name": "Run",
		"children": [
			{ "name": "Run", "command": "run_code" },
			{ "name": "Debug", "command": "debug_code" }
		]
	}
];

module.exports.default = [
	run,
	debug,
];
