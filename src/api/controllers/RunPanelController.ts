import { Transform } from "stream";
import { RunPanelController as RunPanelControllerInterface, DebuggerControllerInterface } from "@/types";
import { CustomDict } from "@/types/CustomDict";
import { BinaryTree } from "@whide/tree-lang";

/**
 * Controller for the "run" panel.
 */
export default class RunPanelController implements RunPanelControllerInterface{
	private readonly _controllers : RunPanelInstanceController[];

	/**
	 *
	 */
	public constructor() {
		this._controllers = [];
	}

	/**
	 * Add a new output area
	 * @param name	The name to use in the tab
	 */
	async addOutputStream(name?: string) : Promise<RunPanelInstanceController> {
		//Get the next available name
		name = this._nextName(name || 'Run');

		//Make an instance controller for this output area
		const instanceController = new RunPanelInstanceController(name);
		//Save the controller
		this._controllers.push(instanceController);
		//Return the controller
		return instanceController;
	}

	/**
	 * Remove an instance controller
	 * @param controller	The controller instance to remove
	 */
	async removeOutputStream(controller: RunPanelInstanceController) {
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
		let start: number = nameSet.size + 1;
		while (nameSet.has(nextName)) nextName = `${prefix} ${start++}`;
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
	private _output: string;
	private readonly _stream: Transform;
	private _variables : CustomDict<BinaryTree>;
	private _debuggerCallbackHandler?: DebuggerControllerInterface;

	/**
	 *
	 * @param name	The name of the output region
	 */
	public constructor(name: string) {
		this._name = name;
		this._output = '';
		this._stream = new Transform();
		this._variables = {};

		//Keep the written data as-is (output in same form as input)
		this._stream._transform = function (chunk, encoding, callback) {
			this.push(chunk, encoding);
			callback();
		}

		//Handle data coming in
		this._stream.on('data', this._onData);

		//The "end" event is emitted when the stream ends and all data has been consumed.
		//The "close" event is emitted when an underlying source has been closed
		//- https://areknawo.com/node-js-file-streams-explained/
		this._stream.on('end', this._onClose);
		this._stream.on('close', this._onClose);
	}

	/**
	 * Handle data being written to the stream
	 * @param chunk	The received data
	 */
	private _onData = (chunk: any) => {
		//Convert to a string
		const str = chunk.toString();
		//Append to the end of the output
		this._output += str;
	}

	/**
	 * Handle the stream closing
	 * @private
	 */
	private _onClose = () => {
		this._output += "\n[Output stream closed]";
	}

	get stream(): Transform {
		return this._stream;
	}

	get output(): string {
		return this._output;
	}

	get name(): string {
		return this._name;
	}

	set name(value: string) {
		this._name = value;
	}

	get variables() : CustomDict<BinaryTree> {
		return this._variables;
	}

	set variables(variables : CustomDict<BinaryTree>) {
		this._variables = variables;
	}

	get debuggerCallbackHandler(): DebuggerControllerInterface|undefined {
		return this._debuggerCallbackHandler;
	}

	set debuggerCallbackHandler(value: DebuggerControllerInterface|undefined) {
		this._debuggerCallbackHandler = value;
	}
}
