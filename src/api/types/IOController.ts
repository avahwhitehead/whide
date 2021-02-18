export interface InputPromptParams {
	/**
	 * @param message	The prompt message
	 */
	message: string;
	/**
	 * @param validator	Input validator functions. Returns `true` if valid, `false` otherwise
	 */
	title?: string;
	/**
	 * @param title		Title to show in the input
	 */
	validator?: ((val: string) => boolean|Promise<boolean>);
}

export interface OutputPromptParams {
	/**
	 * @param message	The output message
	 */
	message: string;
	/**
	 * @param title		Output message title
 	 */
	title?: string;
}

/**
 * Controller interface to allow user input/output
 */
export default interface IOController {
	/**
	 * Function to get user input
	 */
	getInput(params: InputPromptParams) : Promise<string|undefined>;

	/**
	 * Function to show output to the user
	 */
	showOutput(params: OutputPromptParams) : Promise<void>;
}