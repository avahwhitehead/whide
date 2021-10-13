import { BaseRunner } from "@/run/BaseRunner";
import treeConverter, { ConversionResultType, stringify } from "@whide/tree-lang";
import { fs } from "@/files/fs";
import { ENCODING_UTF8 } from "memfs/lib/encoding";
import WhileWorker from "worker-loader!./WhilejsWorker";
import { LoadRequest, RunRequest, WhileWorkerResponse } from "./WhileJsWorkerTypes";

/**
 * Properties for the {@link WhileJsRunner} constructor.
 */
export interface WhileJsRunnerProps {
	/**
	 * Input expression to the program
	 */
	expression: string;
	/**
	 * Path to the file to run
	 */
	file: string;
}

/**
 * Run a program using While.js.
 */
export class WhileJsRunner extends BaseRunner {
	private _props: WhileJsRunnerProps;
	private _worker: WhileWorker|undefined;
	private _loadedCallback: (()=>void)|undefined = undefined;
	private _allowRun: boolean;
	private _isStopped: boolean;

	constructor(props: WhileJsRunnerProps) {
		super();
		this._props = props;
		this._allowRun = false;
		this._isStopped = true;
	}

	/**
	 * Perform setup operations required to run the interpreter.
	 */
	async init(): Promise<void> {
		//Read the program string from the file
		const programString = await fs.promises.readFile(this._props.file, ENCODING_UTF8);

		//Allow the interpreter to be stopped
		this._isStopped = false;

		//Start a worker for the interpreter
		this._worker = this._makeWorker();
		//Load the program
		this._worker.postMessage(WhileJsRunner._makeLoadRequest(
			programString,
			this._props.expression
		));
		//Display the input tree
		this._display(`In: ${this._props.expression}\n`);

		//Don't resolve the promise until the worker thread has loaded the program
		return new Promise((resolve) => {
			this._loadedCallback = resolve;
		});
	}

	/**
	 * Run the program until completion.
	 * Call {@link init} before running.
	 */
	run(): void {
		//Ensure a worker thread exists
		if (this._worker === undefined) {
			throw new Error('No worker thread exists. Ensure `init` has been called');
		}
		this._allowRun = false;
		//Send the run request
		this._worker.postMessage(WhileJsRunner._makeRunRequest());
	}

	stop(): void {
		if (this._worker === undefined) {
			throw new Error('No worker thread exists.');
		}
		//Stop the interpreter thread
		this._worker.terminate();
		this._isStopped = true;
	}

	/**
	 * Create a Worker thread to run the interpreter
	 * @private
	 */
	private _makeWorker(): WhileWorker {
		const worker: WhileWorker = new WhileWorker();

		//Handle messages from the worker thread
		const that = this;
		worker.onmessage = function (event: MessageEvent): void {
			const data: WhileWorkerResponse = event.data;
			switch (data.type) {
				case "loaded":
					//Call the callback, if possible
					if (that._loadedCallback) that._loadedCallback();
					//Allow running
					that._allowRun = true;
					break;
				case "end":
					try {
						//Convert the outputted tree to a human readable format and display it
						let res: ConversionResultType = treeConverter(data.res, 'any');
						that._display(`Out: ${stringify(res.tree)}\n`);
					} catch (e) {
						//Error when converting the tree
						console.error('Error displaying prog result\n', e);
					}
					that.stop();
					break;
				case "error":
					console.error(`Error from WhileJs worker`, data.msg);
					that.stop();
					break;
				default:
					console.error(`Unknown response type: '${event.data.type}'`);
					that.stop();
					break;
			}
		};
		return worker;
	}

	private static _makeLoadRequest(program: string, tree: string): LoadRequest {
		return {
			op: 'load',
			prog: program,
			tree: tree,
		};
	}

	private static _makeRunRequest(): RunRequest {
		return {
			op: 'run',
		};
	}

	get allowRun(): boolean {
		return this._allowRun;
	}

	get isStopped(): boolean {
		return this._isStopped;
	}
}
