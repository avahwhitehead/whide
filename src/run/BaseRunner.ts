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

	abstract get isStopped(): boolean;
	abstract get allowRun(): boolean;
	abstract get allowStep(): boolean;
}