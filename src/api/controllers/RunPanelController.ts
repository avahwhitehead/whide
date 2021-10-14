import { AbstractRunner } from "@/run/AbstractRunner";

/**
 * Controller for the "run" panel.
 */
export default class RunPanelController {
	private readonly _controllers: { name: string, runner: AbstractRunner }[];

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
	addOutputStream(runner: AbstractRunner, name?: string): void {
		//Get the next available name
		name = this._nextName(name || 'Run');
		//Save the controller
		this._addRunner(name, runner);
	}

	/**
	 * Remove an instance controller
	 * @param nameOrRunner	The name of the instance to remove, or the instance's runner
	 */
	removeOutputStream(nameOrRunner: string|AbstractRunner): void {
		for (let i = 0; i < this._controllers.length; i++) {
			const curr = this._controllers[i];
			if (curr.name === nameOrRunner || curr.runner === nameOrRunner) {
				this._controllers.splice(i, 1);
			}
		}
	}

	/**
	 * Add a named runner to the store
	 * @param name		The runner's name
	 * @param runner	The runner
	 * @private
	 */
	private _addRunner(name: string, runner: AbstractRunner): void {
		this._controllers.push({name, runner});
	}

	/**
	 * Get the next available run controller name starting with a given string
	 * @param prefix	The starting string
	 */
	private _nextName(prefix: string = 'Run') {
		let nextName: string = prefix;
		//Set of names starting with this prefix
		let nameSet: Set<string> = new Set(
			this.names.filter(n => n.substr(0, prefix.length) === prefix)
		);
		//Start with the number of the length of the set
		let start: number = nameSet.size;
		while (nameSet.has(nextName)) nextName = `${prefix} (${++start})`;
		return nextName;
	}

	get controllers(): { name: string, runner: AbstractRunner }[] {
		return this._controllers;
	}

	get names(): string[] {
		return this._controllers.map(e => e.name);
	}
}

