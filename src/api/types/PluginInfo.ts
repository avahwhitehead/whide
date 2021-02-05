import { Menu } from "@/api/parsers/MenuParser";
import { PluginFunction } from "@/api/types/PluginFunction";

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
	private _isExternal: boolean;
	private _filePath: string;
	private readonly _menus: Menu[];

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
		this._isExternal = !props.external;
		//Whether the plugin should be disabled (default: false)
		this._disabled = !!props.disabled;
		//The menus created by the plugin (default: [])
		this._menus = props.menus || [];
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

	get menus(): Menu[] {
		return this._menus;
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