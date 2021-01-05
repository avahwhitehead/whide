import { expect } from "chai";
import { describe, it } from "mocha";

import { Menu } from "../../../src/api/parsers/MenuParser";
import { MenuManager } from "../../../src/api/managers/MenuManager";

const MENU_1 : Menu[] = [
	{
		name: "File",
		children: [
			{ name: "Open", command: "run_open" },
			{ name: "Save", command: "run_save" },
		]
	}
];

const MENU_2 : Menu[] = [
	{
		name: "File",
		children: [
			{ name: "Close", command: "run_close" },
		]
	},
	{
		name: "Edit",
		children: [
			{ name: "Copy", command: "run_copy" },
			{ name: "Paste", command: "run_paste" },
		]
	},
	{
		name: "File",
		children: [
			{ name: "Save As", command: "run_save_as" },
		]
	}
];

const MENU_3 : Menu[] = [
	{
		name: "Run",
		children: [
			{ name: "Run", command: "run_run" },
			{ name: "Debug", command: "run_debug" },
		]
	}
];

const MENU_COMBINED : Menu[] = [
	{
		name: "File",
		children: [
			{ name: "Open", command: "run_open" },
			{ name: "Save", command: "run_save" },
			{ name: "Close", command: "run_close" },
			{ name: "Save As", command: "run_save_as" },
		]
	},
	{
		name: "Edit",
		children: [
			{ name: "Copy", command: "run_copy" },
			{ name: "Paste", command: "run_paste" },
		]
	},
	{
		name: "Run",
		children: [
			{ name: "Run", command: "run_run" },
			{ name: "Debug", command: "run_debug" },
		]
	}
];

describe('Register menus', function() {
	it('should produce a set of file/edit/run menus', function() {
		let manager : MenuManager = new MenuManager();
		for (let group of [MENU_1, MENU_2, MENU_3]) {
			for (let menu of group) {
				manager.register(menu);
			}
		}
		expect(manager._menus).to.eql(MENU_COMBINED);
	});
});

describe('Register duplicate menus', function() {
	it('should produce an combined set of menus', function() {
		let manager : MenuManager = new MenuManager();
		let save1 = { name: "Save", command: "save1" };
		let save2 = { name: "Save", command: "save2" };
		manager.register({
			name: "File",
			children: [ save1 ]
		});
		manager.register({
			name: "File",
			children: [ save2 ]
		});

		//Only one "File" menu should be registered
		expect(manager.menus.length).to.eql(1);
		let menu = manager.menus[0];

		//Only one "Save" option should be registered
		expect(menu.children).to.eql([save1]);
	});
});
