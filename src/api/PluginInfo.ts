import { PluginFunction, SettingsItem, TreeConverter } from "@whide/whide-types";
import { Menu } from "@whide/whide-types";
import { InternalMenu } from "@/api/types/InternalMenus";
import setupMenus from "@/api/parsers/MenuParser";

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
	 * The custom tree converters defined by the plugin
	 */
	converters?: TreeConverter[];
	/**
	 * The settings options used by the plugin
	 */
	settings?: SettingsItem[];
}

/**
 *
 */
export class PluginInfo {
	private _name: string;
	private _description: string;
	private _disabled: boolean;
	private _isExternal: boolean;
	private _filePath: string;
	private readonly _menus: InternalMenu[];
	private readonly _converters: TreeConverter[];
	private readonly _settings: SettingsItem[];
	private readonly _settingValues: { [key: string]: string|undefined };

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
		//The custom tree converters created by the plugin (default: [])
		this._converters = props.converters || [];
		//Functions defined by the plugin
		this.funcs = new Map();

		//The plugin's settings and values
		this._settings = props.settings || [];
		this._settingValues = {};
		for (let setting of this._settings) {
			//Ignore if it is an output
			if (typeof setting === "string") continue;
			//Use the default input value
			//TODO: Persist settings
			this._settingValues[setting.id] = setting.default;
		}
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

	get converters(): TreeConverter[] {
		return this._converters;
	}

	public get settings() {
		return this._settings;
	}

	public get settingValues() {
		return this._settingValues;
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
}