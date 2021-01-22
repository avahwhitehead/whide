import { expect } from "chai";
import { describe, it } from "mocha";

import { Menu, MenuItem } from "../../../src/api/parsers/MenuParser";
import { MenuManager } from "../../../src/api/managers/MenuManager";

// ========
// Register
// ========

const MENU_1 : Menu[] = [
	{
		name: "File",
		children: [
			{ name: "Open", command: "run_open", plugin: undefined! },
			{ name: "Save", command: "run_save", plugin: undefined! },
		]
	}
];

const MENU_2 : Menu[] = [
	{
		name: "File",
		children: [
			{ name: "Close", command: "run_close", plugin: undefined! },
		]
	},
	{
		name: "Edit",
		children: [
			{ name: "Copy", command: "run_copy", plugin: undefined! },
			{ name: "Paste", command: "run_paste", plugin: undefined! },
		]
	},
	{
		name: "File",
		children: [
			{ name: "Save As", command: "run_save_as", plugin: undefined! },
		]
	}
];

const MENU_3 : Menu[] = [
	{
		name: "Run",
		children: [
			{ name: "Run", command: "run_run", plugin: undefined! },
			{ name: "Debug", command: "run_debug", plugin: undefined! },
		]
	}
];

const MENU_COMBINED : Menu[] = [
	{
		name: "File",
		children: [
			{ name: "Open", command: "run_open", plugin: undefined! },
			{ name: "Save", command: "run_save", plugin: undefined! },
			{ name: "Close", command: "run_close", plugin: undefined! },
			{ name: "Save As", command: "run_save_as", plugin: undefined! },
		]
	},
	{
		name: "Edit",
		children: [
			{ name: "Copy", command: "run_copy", plugin: undefined! },
			{ name: "Paste", command: "run_paste", plugin: undefined! },
		]
	},
	{
		name: "Run",
		children: [
			{ name: "Run", command: "run_run", plugin: undefined! },
			{ name: "Debug", command: "run_debug", plugin: undefined! },
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
		expect(manager.menus).to.eql(MENU_COMBINED);
	});
});

describe('Register duplicate items', function() {
	it('should produce a menu with only one child', function() {
		let manager : MenuManager = new MenuManager();
		let save1 : MenuItem = { name: "Save", command: "save1", plugin: undefined! };
		let save2 : MenuItem = { name: "Save", command: "save2", plugin: undefined! };
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

// ========
// Unregister
// ========

describe('Unregister all menus', function() {
	it('should produce an empty menu list', function() {
		let manager : MenuManager = new MenuManager();
		let menu : Menu = {
			name: "File",
			children: [
				{ name: "Open", command: "command_open", plugin: undefined! },
				{ name: "Close", command: "command_close", plugin: undefined! },
			]
		};

		//Register the menu
		manager.register(menu);
		//Unregister the menus
		manager.unregister(menu);

		expect(manager.menus).to.eql([]);
	});
});

describe('Unregister child', function() {
	it('should remove a menu item from a menu', function() {
		let manager : MenuManager = new MenuManager();
		manager.register({
			name: "File",
			children: [
				{ name: "Open", command: "run_open", plugin: undefined! },
				{ name: "Close", command: "run_close", plugin: undefined! },
			]
		});
		manager.unregister({
			name: "File",
			children: [
				{ name: "Open", command: "run_open", plugin: undefined! },
			]
		});

		expect(manager.menus).to.eql([{
			name: "File",
			children: [ { name: "Close", command: "run_close", plugin: undefined } ]
		}]);
	});
});


describe('Unregister nothing', function() {
	it('should remove nothing', function() {
		let manager : MenuManager = new MenuManager();
		let menu : Menu = {
			name: "File",
			children: [
				{ name: "Open", command: "run_open", plugin: undefined! },
				{ name: "Close", command: "run_close", plugin: undefined! },
			]
		};

		manager.register(menu);
		manager.unregister({
			name: "File",
			children: [ ]
		});

		expect(manager.menus).to.eql([menu]);
	});
});

describe('Unregister multiple lists', function() {
	it('should unregister from multiple lists', function() {
		let manager : MenuManager = new MenuManager();
		let expected : MenuManager = new MenuManager();
		//Register menus 1 and 2
		for (let m of MENU_1) manager.register(m);
		for (let m of MENU_2) {
			manager.register(m);
			expected.register(m);
		}
		//Unregister menu 1
		for (let m of MENU_1) {
			manager.unregister(m);
		}
		//Compare with menu 2
		expect(manager.menus).to.eql(expected.menus);
	});
});


describe('Unregister empty layers', function() {
	it('should remove all empty layers', function() {
		let manager : MenuManager = new MenuManager();
		//Register two buried menu items 1 and 2
		manager.register({
			name: "Root",
			children: [
				{
					name: "Child 1",
					children: [
						{
							name: "Child 2.1",
							children: [ { name: "Menu Item", command: "item_command", plugin: undefined! } ]
						},
						{
							name: "Child 2.2",
							children: [ { name: "Menu Item 2", command: "item_command", plugin: undefined! } ]
						}
					]
				}
			]
		});
		//Remove the first child
		manager.unregister({
			name: "Root",
			children: [
				{
					name: "Child 1",
					children: [
						{
							name: "Child 2.1",
							children: [ { name: "Menu Item", command: "item_command", plugin: undefined! } ]
						}
					]
				}
			]
		});
		//Remove the other child
		manager.unregister({
			name: "Root",
			children: [
				{
					name: "Child 1",
					children: [
						{
							name: "Child 2.2",
							children: [ { name: "Menu Item 2", command: "item_command", plugin: undefined! } ]
						}
					]
				}
			]
		});

		expect(manager.menus).to.eql([]);
	});
});


describe('Unregister nothing', function() {
	it('should not unregister an entire layer if there are no children', function() {
		let manager : MenuManager = new MenuManager();

		//Register menus 1 and 2
		let menu : Menu = {
			name: "Root",
			children: [
				{
					name: "Child 1",
					children: [
						{
							name: "Menu Item",
							command: "item_command",
							plugin: undefined!
						}
					]
				}
			]
		};
		//Register the menu
		manager.register(menu);
		//Remove nothing from the second layer
		manager.unregister({
			name: "Root",
			children: [
				{
					name: "Child 1",
					children: [ ]
				}
			]
		});

		//Expect no change
		expect(manager.menus).to.eql([menu]);
	});
});
