/**
 * Constants representing the available interpreters from this editor.
 * These are HWhile and While.js
 */
export enum INTERPRETERS {
	HWHILE,
	WHILE_JS,
}

/**
 * The information contained in a "run configuration".
 * This tells the editor how to run a program.
 */
export interface RunConfiguration {
	file: string;
	input: string;
	outputFormat: string;
	name: string;
	interpreter: INTERPRETERS;
}
