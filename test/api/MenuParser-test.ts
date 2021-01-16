import { expect } from "chai";
import { describe, it } from "mocha";

import parse, { Menu } from "../../src/api/parsers/MenuParser";


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


describe('Empty Names', function() {
	it('should produce an open/save/close file menu', function() {
		//TODO: Test empty names
		//let result = parse(`[{"name": "", "children": []]`);
	});
});
