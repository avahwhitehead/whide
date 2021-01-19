import { Menu } from "@/api/parsers/MenuParser";
import { PluginManager as LivePluginManager } from "live-plugin-manager";
import { PluginFunction } from "@/api/types/PluginFunction";

//Plugin manager object to control loading/unloading plugin packages
const _livePluginManager = new LivePluginManager();

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

	private readonly _livePluginManager : LivePluginManager;
	private funcs : Map<string, PluginFunction>;

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

		//The manager to use to load/unload the plugin
		this._livePluginManager = _livePluginManager;
		//Functions defined by the plugin
		this.funcs = new Map();
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

	set disabled(value: boolean) {
		this._disabled = value;
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

	/**
	 * Get a function by its name
	 * @param funcName	The name of the function
	 */
	async getFunc(funcName: string) : Promise<PluginFunction | undefined> {
		//If the function has already been loaded, use that
		if (this.funcs.has(funcName)) return this.funcs.get(funcName);

		try {
			//Attempt to install the plugin
			await this._livePluginManager.installFromPath(this.filePath);
		} catch (e) {
			//Error while installing
			console.error(e);
			return undefined;
		}

		//TODO: Allow this to be an array of `PluginFunction`s
		let func: PluginFunction;
		try {
			//Attempt to require the plugin
			func = this._livePluginManager.require(this._name);
		} catch (e) {
			//Error while requiring
			console.error(e);
			return undefined;
		}

		//Store the function in memory
		this.funcs.set(funcName, func);

		//Return the function
		return func;
	}
}