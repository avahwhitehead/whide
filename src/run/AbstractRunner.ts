import { BinaryTree } from "@whide/tree-lang";

/**
 * Type of objects returned after executing a program.
 */
export type ProgramState = {
	/**
	 * The variable values in each program.
	 * Map structure is {@code program -> (variable -> value)}
	 */
	variables?: Map<string, Map<string, BinaryTree>>,
	/**
	 * The current line in the program execution.
	 */
	currentLine?: number,
	/**
	 * Whether the program is terminated.
	 */
	done?: boolean,
}

/**
 * Options to enable/disable the UI's debugging controls.
 */
export interface RunnerControls {
	/**
	 * Whether the runner is currently stopped.
	 * If {@code true}, the stop control is enabled.
	 */
	readonly isStopped: boolean;
	/**
	 * Whether to allow enable the "step" control.
	 */
	readonly allowStep: boolean;
	/**
	 * Whether to allow enable the "run" control.
	 */
	readonly allowRun: boolean;
}

/**
 * The type of a program runner.
 * E.g. an interpreter/debugger.
 */
export interface AbstractRunner extends RunnerControls {
	/**
	 * The folder in which the runner is operating - the runner's CWD.
	 */
	readonly directory: string;

	/**
	 * The output result of display to the user
	 */
	readonly output: string;

	/**
	 * All the variables in the program.
	 * Datatype is nested map of program name -> (variable name -> variable value).
	 */
	readonly variables?: Map<string, Map<string, BinaryTree>>;

	/**
	 * Perform any setup steps.
	 * Run once at the start of debugging before any other method is called.
	 */
	init(): void|ProgramState|Promise<void>|Promise<ProgramState>;

	/**
	 * Run the program.
	 * Called directly after {@link init}.
	 */
	run(): void|ProgramState|Promise<void>|Promise<ProgramState>;

	/**
	 * Stop executing the program.
	 */
	stop(): void|Promise<void>;

	/**
	 * Optional function.
	 * Execute the next line of the program, then pause.
	 */
	step?(): void|ProgramState|Promise<void>|Promise<ProgramState>;

	/**
	 * Optional function.
	 * Change the value of a variable
	 * @param variable	The name of the variable to change
	 * @param value		The new value to assign to the variable
	 * @param program	The name of the program which has the variable. Default uses the name of the loaded program.
	 * @returns {void|Promise<void>}	No return value
	 * @returns {ProgramState|Promise<ProgramState>}	Object the program state after the variable is updated
	 */
	set?(variable: string, value: BinaryTree|string, program?: string): void|ProgramState|Promise<void>|Promise<ProgramState>;

	/**
	 * Add 1 or more breakpoints to a program's execution.
	 * If a breakpoint is provided as type {@link number}, it is added to the current program.
	 * If the breakpoint is of type {@code {line:number, prog:string\}} then the breakpoint is added to the
	 * program with the given name.
	 * @param val	List or sequence of breakpoints to add
	 */
	addBreakpoints?(...val: (number|{line: number, prog: string})[]): void|Promise<void>;

	/**
	 * Remove 1 or more breakpoints from a program's execution.
	 * If a breakpoint is provided as type {@link number}, it is removed from the current program.
	 * If the breakpoint is of type {@code {line:number, prog:string\}} then the breakpoint is removed from the
	 * program with the given name.
	 * @param val	List or sequence of breakpoints to remove
	 */
	delBreakpoints?(...val: (number|{line: number, prog: string})[]): void|Promise<void>;
}
