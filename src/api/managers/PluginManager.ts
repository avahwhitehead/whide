import { PluginInfo } from "@/api/types/PluginInfo";
import { MenuManager } from "@/api/managers/MenuManager";

/**
 * A manager to control which plugins are currently loaded
 */
export class PluginManager {
	private readonly plugins: Map<string, PluginInfo>;
	private readonly _menuManager: MenuManager;

	/**
	 *
	 */
	constructor() {
		this.plugins = new Map();
		this._menuManager = new MenuManager();
	}

	/**
	 * Get a plugin by name
	 * @param name	The plugin's name
	 * @returns	The plugin's {@link PluginInfo} object, or undefined if not found
	 */
	get(name: string): PluginInfo | undefined {
		return this.plugins.get(name) || undefined;
	}

	/**
	 * Load and enable a new plugin
	 * @param info	The plugin info object to activate
	 */
	register(info: PluginInfo): void {
		//If a plugin with this name already exists, unregister it
		if (this.plugins.has(info.name)) this.unregister(info.name);

		//Store the plugin object
		this.plugins.set(info.name, info);
		//Enable the plugin
		info.disabled = false;
	}

	/**
	 * Disable and remove a plugin
	 * @param name	The name of the plugin
	 */
	unregister(name: string): void {
		//Get the plugin object
		let info: PluginInfo | undefined = this.plugins.get(name);
		if (!info) return;

		//Disable the plugin
		info.disabled = true;
		//Remove the plugin from the map
		this.plugins.delete(name);
	}

	/**
	 * Get an array of the plugins names
	 */
	names(): string[] {
		return Array.from(this.plugins.keys());
	}

	/**
	 * Get an array of the plugins
	 */
	getPlugins(): [string, PluginInfo][] {
		return Array.from(this.plugins.entries());
	}

	/**
	 * Get the menu manager
	 */
	get menuManager(): MenuManager {
		return this._menuManager;
	}
}