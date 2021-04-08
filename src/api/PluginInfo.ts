import { Menu, PluginFunction, SettingsItem } from "@whide/whide-types";
import { InternalMenu } from "@/api/types/InternalMenus";
import setupMenus from "@/api/parsers/MenuParser";
import PersistentDataStore from "@/api/PersistentDataStore";
import { CustomDict } from "@/types/CustomDict";

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
	 * The plugin's description.
	 */
	description?: string;
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
	 * The settings options used by the plugin
	 */
	settings?: SettingsItem[];
}

//Set up the store to store plugin settings information
const pluginInfoStore = new PersistentDataStore({
	dbName: `plugin-settings`,
	description: `Store for plugin-specific settings`,
});

/**
 *
 */
export class PluginInfo {
	private _name: string;
	private _description: string;
	private _disabled: boolean;
	private _isExternal: boolean;
	private _filePath: string;
	private _store: PersistentDataStore;
	private readonly _menus: InternalMenu[];
	private readonly _settings: SettingsItem[];
	private _currentSettings: CustomDict<string|undefined>;

	private readonly funcs : Map<string, PluginFunction>;

	/**
	 *
	 * @param props	Initialisation parameters
	 */
	constructor(props: PluginInfoProps) {
		//Plugin name and description
		this._name = props.name;
		this._description = props.description || '';
		//Plugin file path
		this._filePath = props.path;
		//Whether the plugin is first party
		this._isExternal = !!props.external;
		//Whether the plugin should be disabled (default: false)
		this._disabled = !!props.disabled;
		//The menus created by the plugin (default: [])
		this._menus = setupMenus(props.menus || [], this);
		//Functions defined by the plugin
		this.funcs = new Map();

		//The plugin's settings and values
		this._settings = props.settings || [];

		//Store to use to persist settings
		this._store = pluginInfoStore;

		//Load the stored settings
		this._currentSettings = {};
		this._loadSettings().then(value => this._currentSettings = value);
	}

	get name(): string {
		return this._name;
	}

	set name(value: string) {
		this._name = value;
	}

	get description(): string {
		return this._description;
	}

	set description(value: string) {
		this._description = value;
	}

	get disabled(): boolean {
		return this._disabled;
	}

	set disabled(value: boolean) {
		this._disabled = value;
	}

	get isExternal(): boolean {
		return this._isExternal;
	}

	set isExternal(value: boolean) {
		this._isExternal = value;
	}

	get filePath(): string {
		return this._filePath;
	}

	set filePath(value: string) {
		this._filePath = value;
	}

	get menus(): InternalMenu[] {
		return this._menus;
	}

	public get settings() {
		return this._settings;
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
	 * Create an object containing the current setting-value values for this plugin.
	 * Modify this object, and call {@link saveSettingsObj} to save the new values.
	 * @returns A new object containing the key-value pairs of settings
	 */
	public makeSettingsObj() : CustomDict<string | undefined> {
		return { ...this._currentSettings };
	}

	/**
	 * Accepts a key-value map of setting ids to values.
	 * This object should have been originally produced by {@link makeSettingsObj}.
	 * @param obj	The new settings object to save
	 */
	public async saveSettingsObj(obj: CustomDict<string|undefined>) : Promise<void> {
		//Save the settings
		this._currentSettings = { ...obj };
		//Write the object to persistent storage
		await this._store.write(this.name, obj);
	}

	/**
	 * Read the current settings from persistent storage
	 * @returns	A new settings object containing the stored settings object configuration
	 */
	private async _loadSettings() : Promise<CustomDict<string|undefined>> {
		return await this._store.read(this.name) || {};
	}
}