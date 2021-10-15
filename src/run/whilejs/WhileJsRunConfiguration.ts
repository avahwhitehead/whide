import { BaseRunner } from "@/run/BaseRunner";
import treeConverter, { ConversionResultType, stringify } from "@whide/tree-lang";
import { fs } from "@/files/fs";
import { ENCODING_UTF8 } from "memfs/lib/encoding";
import WhileWorker from "worker-loader!./WhilejsWorker";
import { LoadRequest, RunRequest, WhileWorkerResponse } from "./WhileJsWorkerTypes";
import { MacroManager, parseProgram } from "whilejs";
import path from "path";
import { AST_PROG } from "whilejs/lib/types/ast";

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
		//Read the program string from the files
		let [prog, macros]: [AST_PROG, MacroManager] = await this._loadAllProgramFiles(this._props.file,);

		//Allow the interpreter to be stopped
		this._isStopped = false;

		//Display the input tree
		this._display(`In: ${this._props.expression}\n`);

		//Take the macros out of the manager, and rename them so the programs match the file names
		let macroList: AST_PROG[] = [];
		for (let macro of macros.macros) {
			macroList.push(macro.p);
			macro.p.name.value = macro.n;
		}

		//Start a worker for the interpreter
		this._worker = this._makeWorker();
		//Load the program
		this._worker.postMessage(WhileJsRunner._makeLoadRequest(
				prog,
				this._props.expression,
				macroList
			)
		);

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
		this._isStopped = true;
		if (this._worker !== undefined) {
			//Stop the interpreter thread
			this._worker.terminate();
		}
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

	/**
	 * Load a while program from a file, and also recursively load any referenced macros
	 * @param programFile	The root program file to load
	 * @returns [AST_PROG, MacroManager]	The root program's AST, and a macro manager containing all the referenced programs
	 * @private
	 */
	private async _loadAllProgramFiles(programFile: string): Promise<[AST_PROG, MacroManager]> {
		let ast: AST_PROG = await this._loadProgramFromFile(programFile);

		const parentDir = path.resolve(programFile, '..');

		let macroManager: MacroManager = new MacroManager(ast);
		while (macroManager.hasUnregistered) {
			let macro: string | null = macroManager.getNextUnregistered();
			let ast1: AST_PROG = await this._loadProgramFromFile(
				path.join(parentDir, macro + '.while')
			);
			macroManager.register(ast1);
		}

		return [ast, macroManager];
	}

	/**
	 * Load a WHILE program from a file, and return it as an AST
	 * @param filePath	The path to the file
	 * @returns AST_PROG	The program stored in the file as an AST
	 * @throws Error	If the file cannot be read, or if the program failed to parse
	 * @private
	 */
	private async _loadProgramFromFile(filePath: string): Promise<AST_PROG> {
		const prog: string = await fs.promises.readFile(filePath, ENCODING_UTF8);

		let [ast, errs] = parseProgram(prog);

		if (!ast.complete) {
			//Show errors if parsing failed
			let output: string = `Error parsing program file ${filePath}.\n${errs.length} errors\n`;
			for (let error of errs) {
				output += `Error (${error.position.row}:${error.position.col}): ${error.message}\n`;
			}
			this._display(output);
			throw new Error(`Error parsing program "${filePath}"`);
		}

		return ast;
	}

	private static _makeLoadRequest(program: AST_PROG, tree: string, macros: AST_PROG[]): LoadRequest {
		return {
			op: 'load',
			prog: program,
			tree: tree,
			macros
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
