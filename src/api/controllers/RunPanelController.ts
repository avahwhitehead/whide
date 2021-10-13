import { BinaryTree } from "@whide/tree-lang";
import { AbstractRunner } from "@/run/AbstractRunner";

/**
 * Controller for the "run" panel.
 */
export default class RunPanelController {
	private readonly _controllers : RunPanelInstanceController[];

	/**
	 *
	 */
	public constructor() {
		this._controllers = [];
	}

	/**
	 * Add a new output area
	 * @param runner	Program runner to use in the output
	 * @param name		The name to use in the tab
	 */
	async addOutputStream(runner: AbstractRunner, name?: string) : Promise<RunPanelInstanceController> {
		//Get the next available name
		name = this._nextName(name || 'Run');

		//Make an instance controller for this output area
		const instanceController = new RunPanelInstanceController(name, runner);
		//Save the controller
		this._controllers.push(instanceController);
		//Return the controller
		return instanceController;
	}

	/**
	 * Remove an instance controller
	 * @param controller	The controller instance to remove
	 */
	async removeOutputStream(controller: RunPanelInstanceController): Promise<void> {
		const index = this._controllers.indexOf(controller);
		if (index !== -1) this._controllers.splice(index, 1);
	}

	/**
	 * Get a controller by its name
	 * @param name	The name of the controller
	 */
	async getByName(name: string) : Promise<RunPanelInstanceController | undefined> {
		return this.controllers.find(c => c.name === name);
	}

	/**
	 * Get the next available run controller name starting with a given string
	 * @param prefix	The starting string
	 */
	private _nextName(prefix: string = 'Run') {
		let nextName: string = prefix;
		//Set of names starting with this prefix
		let nameSet: Set<string> = new Set(
			this.controllers.map(e => e.name).filter(n => n.substr(0, prefix.length) === prefix)
		);
		//Start with the number of the length of the set
		let start: number = nameSet.size;
		while (nameSet.has(nextName)) nextName = `${prefix} (${++start})`;
		return nextName;
	}

	get controllers(): RunPanelInstanceController[] {
		return this._controllers;
	}

	get names(): string[] {
		return this._controllers.map(e => e.name);
	}
}

/**
 * Controller for a single output region of the "run" panel
 */
export class RunPanelInstanceController {
	private _name: string;
	private readonly _runner: AbstractRunner;
	private _variables: Map<string, Map<string, BinaryTree>>;

	/**
	 *
	 * @param name		Display name for the controller
	 * @param runner	Program runner outputting to this controller
	 */
	public constructor(name: string, runner: AbstractRunner) {
		this._name = name;
		this._runner = runner;
		this._variables = new Map();
	}

	get output(): string {
		return this.runner.output;
	}

	get name(): string {
		return this._name;
	}

	set name(value: string) {
		this._name = value;
	}

	get variables() : Map<string, Map<string, BinaryTree>> {
		return this._variables;
	}

	set variables(variables : Map<string, Map<string, BinaryTree>>) {
		this._variables = variables;
	}

	get runner(): AbstractRunner {
		return this._runner;
	}

	get isStopped(): boolean {
		return this.runner.isStopped;
	}

	/**
	 * @deprecated
	 */
	setVariablesFromMap(variables : Map<string, Map<string, BinaryTree>>): void {
		this.variables = variables;
	}
}
