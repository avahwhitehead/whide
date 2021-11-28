import { ProgramState } from "@/run/AbstractRunner";
import { BaseDebugger, BaseRunner } from "@/run/BaseRunner";
import path from "path";
import { HWhileConnector, InteractiveHWhileConnector, RunResultType, StepResultType } from "@whide/hwhile-wrapper";
import { BinaryTree } from "whilejs";
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
	/**
	 * Directory for HWhile to run in
	 */
	directory: string;
}

/**
 * Additional properties for the {@link HWhileDebugger} constructor.
 */
export interface HWhileDebugConfigurationProps extends HWhileRunnerProps {
	/**
	 * Breakpoints to set up in the debugger
	 */
	breakpoints?: (number|{line:number, prog:string})[];
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
		super(props.directory);
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
			cwd: this.directory,
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
	private _progName: string|undefined;
	private _allowRun: boolean;
	private _allowStep: boolean;
	private _isStopped: boolean;
	private _variables: Map<string, Map<string, BinaryTree>>;

	constructor(props: HWhileDebugConfigurationProps) {
		super(props.directory);
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
		this.hWhileConnector = new InteractiveHWhileConnector({
			hwhile: 'hwhile',
			cwd: this.directory,
		});

		//Pass interpreter output straight to the output console
		this.hWhileConnector.on("output", (data: string) => this._display(data.toString()));

		//Start the interpreter
		await this.hWhileConnector.start();
		//Load the chosen program
		await this.hWhileConnector.load(this._progName, this._props.expression, true, false);

		//Setup the program breakpoints
		await this.addBreakpoints(...(this._props.breakpoints || []));

		this._allowRun = true;
		this._allowStep = true;
	}

	async run(): Promise<ProgramState> {
		//Run the program
		let result = await this.hWhileConnector!.run(true);
		return this._afterRun(result);
	}

	async step(): Promise<ProgramState> {
		//Step over the next line in the program
		let result = await this.hWhileConnector!.step(true);
		return this._afterRun(result);
	}

	/**
	 * Common operations after a run/step operation
	 * @param result	The result of the run/step operation
	 * @private
	 */
	private async _afterRun(result: StepResultType|RunResultType): Promise<ProgramState> {
		//Read the updated variable values
		this._variables = result.allVariables;
		if (result.done) {
			this._allowRun = false;
			this._allowStep = false;
			await this.stop();
		}
		return {
			done: result.done,
			variables: result.allVariables,
			currentLine: result.line
		};
	}

	async stop(): Promise<void> {
		//Stop the interpreter
		await this.hWhileConnector!.stop();
		this._isStopped = true;
		this._allowStep = false;
		this._allowRun = false;
	}

	async set(name: string, value: BinaryTree|string): Promise<ProgramState> {
		//Ensure there is a version of the tree as a string and a BinaryTree
		let treeString: string;
		if (typeof value === 'string') {
			treeString = value;
		} else {
			treeString = stringifyTree(value);
		}

		let res = await this.hWhileConnector!.setVariable(name, treeString);
		return {
			done: res.done,
			variables: res.allVariables,
			currentLine: res.line,
		};
	}

	async addBreakpoints(...pnts: (number | { line: number; prog: string })[]): Promise<void> {
		for (let val of pnts) {
			if (typeof val === 'number') await this.addBreakpoint(val);
			else await this.addBreakpoint(val.line, val.prog);
		}
		return;
	}

	async delBreakpoints(...pnts: (number | { line: number; prog: string })[]): Promise<void> {
		for (let val of pnts) {
			if (typeof val === 'number') await this.delBreakpoint(val);
			else await this.delBreakpoint(val.line, val.prog);
		}
		return;
	}

	private async addBreakpoint(line: number, prog?: string): Promise<void> {
		await this.hWhileConnector!.addBreakpoint(line, prog);
	}

	private async delBreakpoint(line: number, prog?: string): Promise<void> {
		await this.hWhileConnector!.delBreakpoint(line, prog);
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