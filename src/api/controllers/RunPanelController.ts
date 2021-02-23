import { Transform } from "stream";

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
	 * @param name	The name to use in the tab
	 */
	async addOutputStream(name?: string) : Promise<RunPanelInstanceController> {
		//Use a default name if one wasn't provided
		name = name || `Run ${this._controllers.length + 1}`;

		//Make an instance controller for this output area
		const instanceController = new RunPanelInstanceController(name);
		//Save the controller
		this._controllers.push(instanceController);
		//Return the controller
		return instanceController;
	}

	/**
	 *
	 * @param controller
	 */
	async removeOutputStream(controller: RunPanelInstanceController) {
		const index = this._controllers.indexOf(controller);
		if (index !== -1) this._controllers.splice(index, 1);
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

	/**
	 *
	 * @param name	The name of the output region
	 */
	public constructor(name: string) {
		this._name = name;
		this._output = '';
		this._stream = new Transform();

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
		this._output = this._output + str;
	}

	/**
	 * Handle the stream closing
	 * @private
	 */
	private _onClose() {
		//TODO: Handle stream close
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
}
