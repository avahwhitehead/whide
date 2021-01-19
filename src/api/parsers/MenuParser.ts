import { PluginInfo } from "@/api/types/PluginInfo";

export type Menu = {
	name: string,
	children: (Menu|MenuItem)[],
}

export type MenuItem = {
	name: string,
	command: string,
	plugin: PluginInfo,
};

function _validate(menu : Menu[]) : boolean|string {
	//TODO: Validate menu format
	return true;
}

/**
 * Perform a function on each of the menus/menuItems in a list.
 * This is performed recursively
 * @param menus			Array of Menus/MenuItems
 * @param onMenu		Callback when a Menu is found
 * @param onMenuItem	Callback when a MenuItem is found
 */
function _menuForEach(menus: (Menu | MenuItem)[], onMenu: (m: Menu) => void = () => {}, onMenuItem: (m: MenuItem) => void = () => {}) {
	//Iterate over each item
	menus.forEach(m => {
		if ((<Menu>m).children) {
			//Call the Menu callback
			onMenu(<Menu>m);
			//Recurse through the menu's children
			_menuForEach((<Menu>m).children, onMenu, onMenuItem);
		} else {
			//Call the MenuItem callback
			onMenuItem(<MenuItem>m);
		}
	});
}

export default function parse(content: string, pluginInfo : PluginInfo) : Menu[] {
	let json : Menu[];
	try {
		//Check for valid JSON and matches the `Menu[]` type definition
		json = JSON.parse(content);
	} catch (e) {
		throw new Error("JSON in invalid format");
	}

	//TODO: Validate the object against internal rules
	if (!_validate(json)) throw new Error("Invalid data");

	//Link to the pluginInfo from eachMenuItem
	_menuForEach(json, () => {},
		(m: MenuItem) => {
			m.plugin = pluginInfo;
		}
	);

	//Return the object
	return json;
}