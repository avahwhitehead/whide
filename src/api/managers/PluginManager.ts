import { PluginInfo, PluginInfoProps } from "@/api/PluginInfo";
import { MenuManager } from "@/api/managers/MenuManager";
import { TreeConverterManager } from "@/api/managers/TreeConverterManager";

/**
 * A manager to control which plugins are currently loaded
 */
export class PluginManager {
	private readonly plugins: PluginInfo[];
	private readonly _menuManager: MenuManager;
	private readonly _treeConverterManager: TreeConverterManager;

	/**
	 *
	 */
	constructor() {
		this.plugins = [];
		this._menuManager = new MenuManager();
		this._treeConverterManager = new TreeConverterManager();
	}

	/**
	 * Load and enable a new plugin
	 * @param props	The properties used to register the plugin
	 */
	register(props: PluginInfoProps): PluginInfo {
		//Make the plugin object
		let pluginInfo = new PluginInfo({
			name: props.name,
			path: props.path,
			menus: props.menus || [],
			settings: props.settings || [],
			external: (props.external === undefined) ? true : props.external,
			disabled: (props.disabled === undefined) ? false : props.disabled,
		});

		//Store the plugin object
		this.plugins.push(pluginInfo);

		//Enable the plugin, if required
		if (!props.disabled) this.enablePlugin(pluginInfo);

		//Return the plugin object
		return pluginInfo;
	}

	/**
	 * Disable and remove a plugin
	 * @param pluginInfo	The plugin to unregister
	 */
	unregister(pluginInfo: PluginInfo): void {
		this.disablePlugin(pluginInfo);

		//Remove the plugin from the map
		this.plugins.splice(this.plugins.indexOf(pluginInfo), 1);
	}

	/**
	 * Get an array of the plugins names
	 */
	names(): string[] {
		return this.plugins.map(p => p.name);
	}

	/**
	 * Get an array of the plugins
	 */
	getPlugins(): PluginInfo[] {
		return this.plugins;
	}

	/**
	 * Get the menu manager
	 */
	get menuManager(): MenuManager {
		return this._menuManager;
	}

	/**
	 * Get the Tree Converter manager
	 */
	get treeConverterManager(): TreeConverterManager {
		return this._treeConverterManager;
	}

	/**
	 * Enable the plugin
	 */
	public enablePlugin(pluginInfo: PluginInfo) {
		//Register the menus
		pluginInfo.menus.forEach(m => this._menuManager.register(m));

		//Mark as enabled
		pluginInfo.disabled = false;
	}

	/**
	 * Disable the plugin
	 */
	public disablePlugin(pluginInfo: PluginInfo) {
		//Don't disable system plugins
		if (!pluginInfo.isExternal) {
			throw new Error("Can't disable system plugins");
		}

		//Unregister the menus
		pluginInfo.menus.forEach(m => this._menuManager.unregister(m));

		//Mark as disabled
		pluginInfo.disabled = true;
	}
}