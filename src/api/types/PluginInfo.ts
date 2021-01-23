import { Menu } from "@/api/parsers/MenuParser";
import { PluginManager as LivePluginManager } from "live-plugin-manager";
import { PluginFunction, PluginFunctionParameters } from "@/api/types/PluginFunction";

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
	 * The live plugin manager object to use to load the packages
	 */
	livePluginManager: LivePluginManager;
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
	private readonly funcs : Map<string, PluginFunction>;

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
		this._livePluginManager = props.livePluginManager;
		//Functions defined by the plugin
		this.funcs = new Map();

		if (this._livePluginManager.alreadyInstalled(this.name)) {
			this._livePluginManager.uninstall(this.name)
				.then(() => { /* Uninstall completed successfully */ })
				.catch(e => {
					console.error(e);
				});
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

	set disabled(value: boolean) {
		//Don't disable system plugins
		if (this.isFirstParty && value) throw new Error("Can't disable system plugins");
		//Change the disabled value
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
		if (this.disabled) throw new Error(`Plugin ${this.name} is disabled`);

		//If the function has already been loaded, use that
		if (this.funcs.has(funcName)) return this.funcs.get(funcName);

		try {
			//Attempt to install the plugin, forcing reinstallation if it already exists
			//Forces using the latest version
			await this._livePluginManager.installFromPath(this.filePath, {force: true});
		} catch (e) {
			//Error while installing
			console.error(e);
			return undefined;
		}

		let loadedFunc: PluginFunction|PluginFunction[];
		try {
			//Attempt to require the plugin
			loadedFunc = this._livePluginManager.require(this._name);
		} catch (e) {
			//Error while requiring
			console.error(e);
			return undefined;
		}

		if ((<PluginFunction[]>loadedFunc).length !== undefined) {
			//If the plugin exports an array of functions
			this._loadFuncArray(<PluginFunction[]>loadedFunc);
		} else {
			//If the plugin exports a single function
			this._loadFunc(<PluginFunction>loadedFunc);
		}

		//Return the function
		return this.funcs.get(funcName);
	}

	/**
	 * Register an array of plugin functions
	 * @param funcs	The array of functions
	 */
	private _loadFuncArray(funcs : PluginFunction[]) {
		//Register each individual function
		for (let f of funcs) this._loadFunc(f)
	}

	/**
	 * Register a single plugin function
	 * @param func	The function to register
	 */
	private _loadFunc(func : PluginFunction) {
		//Store the function in memory
		this.funcs.set(func.name, func);
	}
}