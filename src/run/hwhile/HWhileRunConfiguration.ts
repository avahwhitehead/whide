import { ProgramState } from "@/run/AbstractRunner";
import { BaseDebugger, BaseRunner } from "@/run/BaseRunner";
import path from "path";
import { HWhileConnector, InteractiveHWhileConnector, RunResultType, StepResultType } from "@whide/hwhile-wrapper";
import { BinaryTree } from "whilejs";
import { treeParser } from "@whide/tree-lang";
import { stringifyTree } from "@/utils/tree_converters";
import { ChildProcessWithoutNullStreams } from "child_process";

/**
 * Properties for the {@link HWhileRunner} constructor.
 */
export interface HWhileRunnerProps {
	/**
	 * Input expression to the program
	 */
	expression: string;
	/**
	 * Program file to run
	 */
	file: string;
	/**
	 * Path to the HWhile executable
	 */
	hwhile: string;
	/**
	 * Callback for when an error occurs during execution
	 * @param err	The error object
	 */
	onerror?: (err: Error) => void,
}

/**
 * Additional properties for the {@link HWhileDebugger} constructor.
 */
export interface HWhileDebugConfigurationProps extends HWhileRunnerProps {
	/**
	 * Breakpoints to set up in the debugger
	 */
	breakpoints?: number[];
}

/**
 * Run a program using HWhile.
 */
export class HWhileRunner extends BaseRunner {
	private _props: HWhileRunnerProps;
	private _shell: ChildProcessWithoutNullStreams|null;
	private _hWhileConnector: HWhileConnector|null;
	private _allowRun: boolean;
	private _isStopped: boolean;

	constructor(props: HWhileRunnerProps) {
		super();
		this._props = props;
		this._shell = null;
		this._hWhileConnector = null;

		this._allowRun = false;
		this._isStopped = true;
	}

	init(): void {
		this._isStopped = false;
		//Start the interpreter in the same directory as the file
		this._hWhileConnector = new HWhileConnector({
			hwhile: this._props.hwhile,
			cwd: path.dirname(this._props.file),
		});
		this._allowRun = true;
	}

	run(): void {
		if (!this._hWhileConnector) {
			throw new Error(`No HWhile connector is defined. Has init been called?`);
		}
		this._allowRun = false;
		//Run the file
		this._shell = this._hWhileConnector.run(
			path.basename(this._props.file),
			this._props.expression,
			false
		);

		//Pass interpreter output straight to the output console
		this._shell.stdout.on("data", (data: Buffer) => this._display(data.toString()));
		//Handle errors/close
		this._shell.on('error', (error: Error) => {
			if (this._props.onerror) this._props.onerror(error);
			else console.error(error);
		});
		this._shell.on("close", () => this.stop());
	}

	stop(): void | Promise<void> {
		this._shell?.kill();
		this._isStopped = true;
	}

	get allowRun(): boolean {
		return this._allowRun;
	}

	get isStopped(): boolean {
		return this._isStopped;
	}
}

/**
 * Debug a program using HWhile
 */
export class HWhileDebugger extends BaseDebugger {
	private _props: HWhileDebugConfigurationProps;
	private hWhileConnector: InteractiveHWhileConnector|undefined;
	private _currentState: ProgramState|undefined;
	private _progName: string|undefined;
	private _allowRun: boolean;
	private _allowStep: boolean;
	private _isStopped: boolean;
	private _variables: Map<string, Map<string, BinaryTree>>;

	constructor(props: HWhileDebugConfigurationProps) {
		super();
		this._props = props;
		this._allowRun = false;
		this._allowStep = false;
		this._isStopped = true;
		this._variables = new Map<string, Map<string, BinaryTree>>();
	}

	async init(): Promise<void> {
		this._isStopped = false;
		//Get the file name and program name
		const file_name = path.basename(this._props.file);
		this._progName = file_name.split('.')[0];

		//Start the interpreter in the same directory as the file
		const folder_path = path.dirname(this._props.file);
		this.hWhileConnector = new InteractiveHWhileConnector({
			hwhile: 'hwhile',
			cwd: folder_path,
		});

		//Pass interpreter output straight to the output console
		this.hWhileConnector.on("output", (data: string) => this._display(data.toString()));

		//Start the interpreter
		await this.hWhileConnector.start();
		//Load the chosen program
		await this.hWhileConnector.load(this._progName, this._props.expression, true);

		//Setup the program breakpoints
		for (let b of this._props.breakpoints || []) {
			await this.hWhileConnector.addBreakpoint(b);
		}

		this._allowRun = true;
		this._allowStep = true;
	}

	async run(): Promise<ProgramState> {
		//Run the program
		let result = await this.hWhileConnector!.run(true);
		return await this._afterRun(result);
	}

	async step(): Promise<ProgramState> {
		//Step over the next line in the program
		let result = await this.hWhileConnector!.step(true);
		return await this._afterRun(result);
	}

	/**
	 * Common operations after a run/step operation
	 * @param result	The result of the run/step operation
	 * @private
	 */
	private async _afterRun(result: StepResultType|RunResultType) {
		//Read the updated variable values
		this._variables = await this.hWhileConnector!.store(true);
		//Stop the process here if the program is done
		if (result.cause === 'done') {
			await this.stop();
			this._currentState = {
				variables: this._variables,
				done: true,
			};
		} else {
			this._currentState = {
				variables: this._variables,
				done: false,
			};
		}
		//Return the program state
		return this._currentState;
	}

	async stop(): Promise<void> {
		//Stop the interpreter
		await this.hWhileConnector!.stop();
		this._isStopped = true;
		this._allowStep = false;
		this._allowRun = false;
	}

	async set(name: string, value: BinaryTree|string, program?: string): Promise<ProgramState> {
		if (!program) program = this._progName!;

		//Ensure there is a version of the tree as a string and a BinaryTree
		let tree: BinaryTree;
		let treeString: string;
		if (typeof value === 'string') {
			treeString = value;
			tree = treeParser(value);
		} else {
			tree = value;
			treeString = stringifyTree(value);
		}

		//Update the tree in HWhile
		await this.hWhileConnector!.execute(`${name} := ${treeString}`, true);

		//Create the program state if necessary
		if (!this._currentState) this._currentState = {};
		if (!this._currentState.variables) {
			//Fetch the variable values from the interpreter
			this._currentState.variables = await this.hWhileConnector!.store(true);
		}

		//Update the tree value in the program state
		let programMap: Map<string,BinaryTree>|undefined = this._currentState.variables.get(program);
		if (programMap) {
			programMap.set(name, tree);
		} else {
			programMap = new Map();
			programMap.set(name, tree);
			this._currentState.variables.set(program, programMap);
		}

		//Return the program state
		return this._currentState;
	}

	get variables(): Map<string, Map<string, BinaryTree>> {
		return this._variables;
	}

	get allowRun(): boolean {
		return this._allowRun;
	}
	get allowStep(): boolean {
		return this._allowStep;
	}
	get isStopped(): boolean {
		return this._isStopped;
	}
}