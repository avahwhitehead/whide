import { expect } from "chai";
import { describe, it } from "mocha";

import parse from "../../src/api/parsers/MenuParser";

describe('File Menu', function() {
	it('should produce an open/save/close file menu', function() {
		let result = parse(`
[
	{
		"name": "File",
		"children": [
			{ "name": "Open", "command": "run_open" },
			{ "name": "Save", "command": "run_save" },
			{ "name": "Close", "command": "run_close" }
		]
	}
]`);
		expect(result).to.eql([
			{
				name: "File",
				children: [
					{ name: "Open", command: "run_open" },
					{ name: "Save", command: "run_save" },
					{ name: "Close", command: "run_close" },
				]
			}
		]);
	});
});


describe('Empty Menu Name', function() {
	it('should throw an error', function() {
		expect(
			parse(`[{"name": "", "children": []]`)
		).to.throw(Error, "Menus must be named");
	});
});

describe('Empty Menu Item Name', function() {
	it('should throw an error', function() {
		expect(
			parse(`[{"name": "hello", "children": [{ "name": "", command: "run_me"}]]`)
		).to.throw(Error, "Menu items must be named");
	});
});

describe('Empty Menu Item Command', function() {
	it('should throw an error', function() {
		expect(
			parse(`[{"name": "hello", "children": [{ "name": "Click", command: ""}]]`)
		).to.throw(Error, "Menu items must have a command");
	});
});
