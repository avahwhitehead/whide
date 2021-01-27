/**
 * Controller interface to allow user input/output
 */
export default interface IOController {
	/**
	 * Function to get user input
	 * @param message	The prompt message
	 * @param validator	Input validator functions. Returns `true` if valid, `false` otherwise
	 */
	getInput(message: string, validator?: ((val: string) => boolean|Promise<boolean>)) : Promise<string|undefined>;

	/**
	 * Function to show output to the user
	 */
	showOutput(message: string) : Promise<void>;
}