import { AbstractDebugger, AbstractRunner, ProgramState } from "@/run/AbstractRunner";
import path from "path";
import { HWhileConnector, InteractiveHWhileConnector } from "@whide/hwhile-wrapper";
import { Writable } from "stream";
import { BinaryTree } from "whilejs";
import { treeParser } from "@whide/tree-lang";
import { stringifyTree } from "@/utils/tree_converters";

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
	 * Output stream to write the output to
	 */
	output: Writable;
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
export class HWhileRunner implements AbstractRunner {
	private _props: HWhileRunnerProps;

	constructor(props: HWhileRunnerProps) {
		this._props = props;
	}

	init(): void {
		//No setup required
	}

	run(): void {
		//Get the file name and parent folder
		const file_name = path.basename(this._props.file);
		const folder_path = path.dirname(this._props.file);

		//Start the interpreter in the same directory as the file
		const hWhileConnector = new HWhileConnector({
			hwhile: this._props.hwhile,
			cwd: folder_path,
		});

		//Run the file
		let shell = hWhileConnector.run(file_name, this._props.expression, false);

		//Pass interpreter output straight to the output console
		shell.stdout.on("data", (data: Buffer) => this._props.output.write(data.toString()));
		//Handle errors/close
		shell.on('error', (error: Error) => console.log(` error: ${error.message}`));
		shell.on("close", () => this._props.output.end());
	}
}

export class HWhileDebugger implements AbstractDebugger {
	private _props: HWhileDebugConfigurationProps;
	private hWhileConnector: InteractiveHWhileConnector|undefined;
	private _currentState: ProgramState|undefined;
	private _progName: string|undefined;

	constructor(props: HWhileDebugConfigurationProps) {
		this._props = props;
	}

	async init(): Promise<void> {
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
		this.hWhileConnector.on("output", (data: string) => this._props.output.write(data.toString()));

		//Start the interpreter
		await this.hWhileConnector.start();
		//Load the chosen program
		await this.hWhileConnector.load(this._progName, this._props.expression, true);

		//Setup the program breakpoints
		for (let b of this._props.breakpoints || []) {
			await this.hWhileConnector.addBreakpoint(b);
		}
	}

	async run(): Promise<ProgramState> {
		//Run the program
		let result = await this.hWhileConnector!.run(true);
		//Read the variable values
		let variables = await this.hWhileConnector!.store(true);
		//Stop the process here if the program is done
		if (result.cause === 'done') {
			await this.stop();
			this._currentState = {
				variables,
				done: true,
			};
		} else {
			this._currentState = {
				variables,
				done: false,
			};
		}
		//Return the program state
		return this._currentState;
	}

	async step(): Promise<ProgramState> {
		//Step over the next line in the program
		let result = await this.hWhileConnector!.step(true);
		//Read the variable values
		let variables = await this.hWhileConnector!.store(true);
		//Stop the process here if the program is done
		if (result.cause === 'done') {
			await this.stop();
			this._currentState = {
				variables,
				done: true,
			};
		} else {
			this._currentState = {
				variables,
				done: false,
			};
		}
		//Return the program state
		return this._currentState;
	}

	async stop(): Promise<void> {
		//Stop the interpreter
		await this.hWhileConnector!.stop();
		//Close the output stream
		this._props.output.end();
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
}