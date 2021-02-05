/**
 * Controller interface to allow user input/output
 */
export default interface IOController {
	/**
	 * Function to get user input
	 * @param message	The prompt message
	 * @param validator	Input validator functions. Returns `true` if valid, `false` otherwise
	 * @param title		Title to show in the input
	 */
	getInput(message: string, validator?: ((val: string) => boolean|Promise<boolean>), title?: string) : Promise<string|undefined>;

	/**
	 * Function to show output to the user
	 * @param message	The output message
	 * @param title		Output message title
	 */
	showOutput(message: string, title: string) : Promise<void>;
}