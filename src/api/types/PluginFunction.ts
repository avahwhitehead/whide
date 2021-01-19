/**
 * Describe an argument to prompt the user for
 */
export type Argument = {
	name: string,
	description?: string,
	optional?: boolean,
	default?: string,
	validator?: (v: string) => boolean|Promise<boolean>,
};

/**
 * Hold the parameters to pass to the function when it's called.
 */
export type PluginFunctionParameters = {
	/**
	 * The argument values as `name: value` pairs
	 */
	args: {[key: string]: string},
	/**
	 * The `console` object to allow plugins to output to the console
	 */
	console: Console,
}

/**
 * A callable function exported from a plugin
 */
export type PluginFunction = {
	/**
	 * The name of the function used to link it to the interface.
	 */
	name: string,
	/**
	 * Arguments to be passed to the function when called.
	 */
	args?: [Argument];
	/**
	 * The function to run
	 * @param params	All parameters passed to the function. See {@link PluginFunctionParameters}
	 */
	run: (params : PluginFunctionParameters) => void | Promise<void>;
}