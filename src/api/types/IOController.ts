export interface InputPromptParams {
	/**
	 * The prompt message
	 */
	message: string;
	/**
	 * Title to show in the input
	 */
	title?: string;
	/**
	 * Input validator function; should returns `true` if the string is an acceptable input, `false` otherwise
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