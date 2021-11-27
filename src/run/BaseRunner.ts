import { AbstractRunner, ProgramState } from "@/run/AbstractRunner";
import { BinaryTree } from "whilejs";

/**
 * Utility parent class used by {@link BaseRunner} and {@link BaseDebugger} to provide output utilities for child classes.
 */
export abstract class BaseOutputController {
	private _output: string;

	protected constructor() {
		this._output = '';
	}

	/**
	 * The text output of the runner.
	 */
	public get output(): string {
		return this._output;
	}

	/**
	 * Display some string at the end of the output
	 * @param str	The text to display
	 * @protected
	 */
	protected _display(str: string): void {
		this._output += str;
	}
}

/**
 * Parent class partially implementing {@link AbstractRunner} for use by interpreters.
 */
export abstract class BaseRunner extends BaseOutputController implements AbstractRunner {
	protected constructor() {
		super();
	}

	abstract init(): void|ProgramState|Promise<void>|Promise<ProgramState>;

	abstract run(): void|ProgramState|Promise<void>|Promise<ProgramState>;

	abstract stop(): void|Promise<void>;

	abstract get isStopped(): boolean;
	abstract get allowRun(): boolean;

	/**
	 * Disable stepping in interpreters
	 */
	get allowStep(): boolean {
		return false;
	}
}

/**
 * Parent class partially implementing {@link AbstractRunner} for use by debuggers.
 */
export abstract class BaseDebugger extends BaseOutputController implements AbstractRunner {
	protected constructor() {
		super();
	}

	abstract init(): void|ProgramState|Promise<void>|Promise<ProgramState>;

	abstract run(): void|ProgramState|Promise<void>|Promise<ProgramState>;

	abstract stop(): void|Promise<void>;

	abstract set(variable: string, value: BinaryTree|string, program?: string): void|ProgramState|Promise<void>|Promise<ProgramState>;

	abstract step(): void|ProgramState|Promise<void>|Promise<ProgramState>;

	/**
	 * Add 1 or more breakpoints to a program's execution.
	 * If a breakpoint is provided as type {@link number}, it is added to the current program.
	 * If the breakpoint is of type {@code {line:number, prog:string\}} then the breakpoint is added to the
	 * program with the given name.
	 * @param val	List or sequence of breakpoints to add
	 */
	abstract addBreakpoints(...val: (number|{line: number, prog: string})[]): void|Promise<void>;

	/**
	 * Remove 1 or more breakpoints from a program's execution.
	 * If a breakpoint is provided as type {@link number}, it is removed from the current program.
	 * If the breakpoint is of type {@code {line:number, prog:string\}} then the breakpoint is removed from the
	 * program with the given name.
	 * @param val	List or sequence of breakpoints to remove
	 */
	abstract delBreakpoints(...val: (number|{line: number, prog: string})[]): void|Promise<void>;

	abstract get isStopped(): boolean;
	abstract get allowRun(): boolean;
	abstract get allowStep(): boolean;
}