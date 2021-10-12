import { AbstractRunner } from "@/run/AbstractRunner";
import { Writable } from "stream";
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
	/**
	 * Output stream to write the output to
	 */
	output: Writable;
}

/**
 * Run a program using While.js.
 */
export class WhileJsRunner implements AbstractRunner {
	private _props: WhileJsRunnerProps;
	private _worker: WhileWorker|undefined;
	// private _isLoaded: boolean = false;
	private _loadedCallback: (()=>void)|undefined = undefined;

	constructor(props: WhileJsRunnerProps) {
		this._props = props;
	}

	/**
	 * Perform setup operations required to run the interpreter.
	 */
	async init(): Promise<void> {
		//Read the program string from the file
		const programString = await fs.promises.readFile(this._props.file, ENCODING_UTF8);

		//Start a worker for the interpreter
		this._worker = this._makeWorker();
		//Load the program
		this._worker.postMessage(WhileJsRunner._makeLoadRequest(
			programString,
			this._props.expression
		));
		//Display the input tree
		this.outputStream.write(`In: ${this._props.expression}\n`);

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
		//Send the run request
		this._worker.postMessage(WhileJsRunner._makeRunRequest());
	}

	stop(): void {
		if (this._worker === undefined) {
			throw new Error('No worker thread exists.');
		}
		this._worker.terminate();
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
					break;
				case "end":
					try {
						//Convert the outputted tree to a human readable format and display it
						let res: ConversionResultType = treeConverter(data.res, 'any');
						that.outputStream.write(`Out: ${stringify(res.tree)}\n`);
					} catch (e) {
						//Error when converting the tree
						console.error('Error displaying prog result\n', e);
						return;
					}
					worker.terminate();
					break;
				case "error":
					console.error(`Error from WhileJs worker`, data.msg);
					worker.terminate();
					break;
				default:
					console.error(`Unknown response type: '${event.data.type}'`);
					worker.terminate();
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

	get outputStream(): Writable {
		return this._props.output;
	}
}
