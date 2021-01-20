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
		this._enable(info);
	}

	/**
	 * Disable and remove a plugin
	 * @param name	The name of the plugin
	 */
	unregister(name: string): void {
		//Disable the plugin
		this.setEnabled(name, false);
		//Remove the plugin from the map
		this.plugins.delete(name);
	}

	/**
	 * Enable a plugin
	 * @param name	The name of the plugin
	 */
	enable(name: string) {
		this.setEnabled(name, true)
	}

	/**
	 * Disable a plugin
	 * @param name	The name of the plugin
	 */
	disable(name: string) {
		this.setEnabled(name, false)
	}

	/**
	 * Enable or disable a plugin
	 * @param name		The name of the plugin
	 * @param enabled	{@code true} to enable the plugin, {@code false} to disable
	 */
	setEnabled(name: string, enabled: boolean = true) {
		//Get the plugin object
		let info: PluginInfo | undefined = this.plugins.get(name);
		//Do nothing if the plugin name doesn't exist
		if (!info) return;

		//Enable/disable the plugin
		if (enabled) this._enable(info);
		else this._disable(info);
	}

	/**
	 * Get an array of the plugins names
	 */
	names(): string[] {
		return Array.from(this.plugins.keys());
	}

	/**
	 * Enable a plugin
	 * @param plugin	The plugin object
	 */
	_enable(plugin: PluginInfo) {
		//Register the menus
		plugin.menus.forEach(m => this._menuManager.register(m));
	}

	/**
	 * Disable a plugin
	 * @param plugin	The plugin object
	 */
	_disable(plugin: PluginInfo) {
		//Unregister the menus
		plugin.menus.forEach(m => this._menuManager.unregister(m));
	}

	/**
	 * Get the menu manager
	 */
	get menuManager(): MenuManager {
		return this._menuManager;
	}
}