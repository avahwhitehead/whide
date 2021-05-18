/**
 * The type of a program runner.
 * E.g. an interpreter/compiler.
 */
export interface AbstractRunner {
	/**
	 * Perform any setup steps.
	 * Run once at the start of debugging before any other method is called.
	 */
	init(): void|Promise<void>;

	/**
	 * Run the program.
	 * Called directly after {@link init}.
	 */
	run(): void|Promise<void>;
}

/**
 * The type of a program debugger.
 */
export interface AbstractDebugger extends AbstractRunner {
	/**
	 * Run to program completion, or until the next breakpoint.
	 * Called once immediately after {@link init}.
	 */
	run() : void|Promise<void>;
	/**
	 * Execute the next line of the program, then pause.
	 */
	step() : void|Promise<void>;
	/**
	 * Stop executing the program.
	 */
	stop() : void|Promise<void>;
}
