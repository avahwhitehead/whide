import { PluginInfo } from "@/api/PluginInfo";
import { Menu, MenuItem } from "@whide/whide-types";
import { InternalMenu, InternalMenuItem } from "@/api/types/InternalMenus";

/**
 * Check whether menus
 * @param menus	The menu(s) to validate
 * @returns	An error string, or `false` if valid
 */
function _getError(menus : Menu[]) : boolean|string {
	//Check whether a string is empty (empty or only whitespace)
	const isEmpty = (s : string) => !!s && !!(s.replace(/\s+/g, ''));

	let errorMsg : string = "";

	let valid = _menuForEach(menus,
		//Menus must have a name
		(m: Menu) => {
			if (!isEmpty(m.name)) {
				errorMsg = "Menus must be named";
				return false;
			}
			return true;
		},
		//Menu items must have a name and command
		(m: MenuItem) => {
			if (!isEmpty(m.name)) {
				errorMsg = "Menu items must be named";
				return false;
			}
			if (!isEmpty(m.command)){
				errorMsg = "Menu items must have a command";
				return false;
			}
			return true;
		}
	);
	//Return an error message, or `false`.
	if (valid) return false;
	return errorMsg;
}

/**
 * Perform a function on each of the menus/menuItems in a list.
 * This is performed recursively
 * @param menus			Array of Menus/MenuItems
 * @param onMenu		Callback when a Menu is found
 * @param onMenuItem	Callback when a MenuItem is found
 */
function _menuForEach(menus: (Menu | MenuItem)[],
					onMenu: (m: Menu) => boolean|void = () => {},
					onMenuItem: (m: MenuItem) => boolean|void = () => {}) : boolean {
	//Iterate over each item
	for (let m of menus) {
		if ((<Menu>m).children) {
			//Call the Menu callback, stopping if required
			if (onMenu(<Menu>m) === false) return false;
			//Recurse through the menu's children, stopping if required
			else if (!_menuForEach((<Menu>m).children, onMenu, onMenuItem)) return false;
		} else {
			//Call the MenuItem callback, stopping if required
			if (onMenuItem(<MenuItem>m) === false) return false;
		}
	}
	return true;
}

/**
 * Convert from a list of module `Menu`s to a list of `InternalMenu`s
 * @param menus
 * @param pluginInfo	PluginInfo object.
 */
export default function setupMenus(menus: Menu[], pluginInfo : PluginInfo) : InternalMenu[] {
	//Check the menus are valid
	let error = _getError(menus);
	if (error) throw new Error(`Invalid menus: "${error}"`);

	//Link to the pluginInfo from eachMenuItem
	_menuForEach(menus, () => {},
		(m: MenuItem) => {
			(m as InternalMenuItem).plugin = pluginInfo;
		}
	);

	//Return the object
	return menus as InternalMenu[];
}