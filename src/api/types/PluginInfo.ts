import setupMenus, { Menu } from "@/api/parsers/MenuParser";
import { PluginFunction } from "@/api/types/PluginFunction";
import { MenuManager } from "@/api/managers/MenuManager";

/**
 * The parameters used to initialise the PluginInfo object
 */
export interface PluginInfoProps {
	/**
	 * Name of the plugin
	 */
	name: string;
	/**
	 * Path to the plugin root
	 */
	path: string;
	/**
	 * Whether the plugin should be disabled
	 */
	disabled?: boolean;
	/**
	 * Whether the plugin is not a first-party plugin.
	 */
	external?: boolean;
	/**
	 * The menu items defined by the plugin
	 */
	menus?: Menu[];
	/**
	 * The menu manager object to use
	 */
	menuManager: MenuManager,
}

/**
 *
 */
export class PluginInfo {
	private _name: string;
	private _disabled: boolean;
	private _isFirstParty: boolean;
	private _filePath: string;
	private readonly _menus: Menu[];

	private readonly funcs : Map<string, PluginFunction>;
	private readonly _menuManager : MenuManager;

	/**
	 *
	 * @param props	Initialisation parameters
	 */
	constructor(props: PluginInfoProps) {
		//Plugin name
		this._name = props.name;
		//Plugin file path
		this._filePath = props.path;
		//Whether the plugin is first party
		this._isFirstParty = !!props.external;
		//Whether the plugin should be disabled (default: false)
		this._disabled = !!props.disabled;
		//The menus created by the plugin (default: [])
		this._menus = props.menus || [];

		//Functions defined by the plugin
		this.funcs = new Map();
		//The menu manager to use
		this._menuManager = props.menuManager;

		//Disable/enable the plugin on load
		this.disabled = !!props.disabled;

		//Load the menus
		if (this.menus) {
			setupMenus(this.menus, this);
			//Register menu items
			for (let menu of this.menus) {
				this.menuManager.register(menu);
			}
		}
	}

	get name(): string {
		return this._name;
	}

	set name(value: string) {
		this._name = value;
	}

	get disabled(): boolean {
		return this._disabled;
	}

	/**
	 * Enable or disable a plugin
	 * @param value	{@code true} to disable the plugin, {@code false} to enable
	 */
	set disabled(value: boolean) {
		//Don't disable system plugins
		if (this.isFirstParty && value) throw new Error("Can't disable system plugins");
		//Change the disabled value
		this._disabled = value;

		//Enable/disable the plugin
		if (value) this._disable();
		else this._enable();
	}

	get isFirstParty(): boolean {
		return this._isFirstParty;
	}

	set isFirstParty(value: boolean) {
		this._isFirstParty = value;
	}

	get filePath(): string {
		return this._filePath;
	}

	set filePath(value: string) {
		this._filePath = value;
	}

	get menus(): Menu[] {
		return this._menus;
	}

	get menuManager() : MenuManager {
		return this._menuManager;
	}

	/**
	 * Get a function by its name
	 * @param funcName	The name of the function
	 */
	async getFunc(funcName: string) : Promise<PluginFunction | undefined> {
		if (this.disabled) throw new Error(`Plugin ${this.name} is disabled`);
		//Return the function
		return this.funcs.get(funcName);
	}

	/**
	 * Register an array of plugin functions
	 * @param funcs	The array of functions
	 */
	public registerFuncs(funcs : PluginFunction|PluginFunction[]) {
		//The plugin exports a single function
		if ((<PluginFunction[]>funcs).length === undefined) this.registerFunc(<PluginFunction>funcs);
		//The plugin exports an array of functions
		else {
			for (let f of <PluginFunction[]>funcs) this.registerFunc(f);
		}
	}

	/**
	 * Register a single plugin function
	 * @param func	The function to register
	 */
	public registerFunc(func : PluginFunction) {
		//Store the function in memory
		this.funcs.set(func.name, func);
	}

	/**
	 * Enable the plugin
	 */
	private _enable() {
		//Register the menus
		this.menus.forEach(m => this._menuManager.register(m));
	}

	/**
	 * Disable the plugin
	 */
	private _disable() {
		//Unregister the menus
		this.menus.forEach(m => this._menuManager.unregister(m));
	}
}