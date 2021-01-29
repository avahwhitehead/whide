import Commander from "commander";

const packageJson : any = require("../package.json");

/**
 * Interface extending ${@link Commander.Command} to add definitions for the command line arguments
 */
export interface CliArgValues extends Commander.Command {
	safe?: boolean;
}

/**
 * Make a new command line arguments parser with the supported options
 * @param argv	Optional command line arguments to parse after creation
 */
export function makeCliParser(argv? : string[]) : CliArgValues {
	//Create a new Command object
	let program = new Commander.Command("whide");
	//Register the version number
	program.version(packageJson.version);

	//Set up the command line arguments
	program.option('--safe', 'Start the editor in safe mode (no external plugins)');

	//Parse the provided arguments, if possible
	if (argv) program.parse(argv);

	//Return the manager
	return program;
}

/**
 * A global object which can be accessed from anywhere
 */
export const defaultCliParser = makeCliParser();