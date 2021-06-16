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
 * The type of a program runner.
 * E.g. an interpreter/compiler.
 */
export interface AbstractRunner {
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
}

/**
 * The type of a program debugger.
 */
export interface AbstractDebugger extends AbstractRunner {
	/**
	 * Run to program completion, or until the next breakpoint.
	 * Called once immediately after {@link init}.
	 */
	run(): void|ProgramState|Promise<void>|Promise<ProgramState>;
	/**
	 * Execute the next line of the program, then pause.
	 */
	step(): void|ProgramState|Promise<void>|Promise<ProgramState>;
	/**
	 * Stop executing the program.
	 */
	stop(): void|Promise<void>;
}
