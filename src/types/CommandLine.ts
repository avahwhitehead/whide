import Commander, { Command } from "commander";

/**
 * Types of the command line argument values
 */
export interface ProgramOptions extends Commander.OptionValues {
	workingDir?: string;
}

/**
 * Modified version of `Commander.Command` to allow typing the `opts`
 */
export interface ExtendedCommand extends Commander.Command {
	opts() : ProgramOptions;
}

/**
 * Make a Commander Command object for this program's options
 */
export function makeCommandLineParser() : ExtendedCommand {
	//Make the command
	let program = new Command("whide");
	//Options
	program
		.option("--safe", "Start in safe mode (no user plugins).")
		.option("-d, --working-dir [dir]", "The initial directory to open. Default is the current path (electron) or root (browser).");
	//Enable the help command (doesn't work when using `electron:serve`)
	program.addHelpCommand("-h, --help");
	//Return the command
	return program;
}