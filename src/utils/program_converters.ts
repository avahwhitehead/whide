import { AST_PROG, AST_PROG_PARTIAL } from "whilejs/lib/types/ast";
import { ErrorType, MacroManager, parseProgram, ProgramManager } from "whilejs";
import path from "path";
import { fs } from "@/files/fs";
import { ENCODING_UTF8 } from "memfs/lib/encoding";

export async function prog_to_pure_while(progStr: string, progName: string, folder: string): Promise<[ProgramManager, null] | [null, string]> {
	//Attempt to parse the program
	const [prog, err]: [AST_PROG|null, string|null] = _parseProgram(progStr, progName);
	if (!prog) return [null, err!];

	//Load all the macros linked by the program
	let macroManager = new MacroManager(prog);
	while (macroManager.hasUnregistered) {
		const macro: string = macroManager.getNextUnregistered()!;
		const filePath = path.join(folder, macro + '.while');
		//Check te macro file exists
		if (!fs.existsSync(filePath)) return [null, `Couldn't find macro ${filePath}`];

		//Parse the macro program
		let progStr: string;
		try {
			progStr = await fs.promises.readFile(filePath, {encoding: ENCODING_UTF8});
		} catch (e) {
			return [null, `Couldn't read macro file ${filePath}: ` + e.message];
		}
		const [ast, err] = _parseProgram(progStr, filePath);
		if (!ast) return [null, err!];
		//Register the macro in the manager
		macroManager.register(ast);
	}

	//Convert the program to Pure WHILE
	let progManager: ProgramManager = new ProgramManager(prog);
	progManager.toPure(macroManager.macros);
	//Return the program manager object
	return [progManager, null];
}

/**
 * Parse a program string into an AST, automatically building an error string if required.
 * @param progStr	The program to parse
 * @param fileName	The name of the program
 */
function _parseProgram(progStr: string, fileName: string): [AST_PROG, null]|[null, string] {
	const [ast, err]: [AST_PROG|AST_PROG_PARTIAL, ErrorType[]] = parseProgram(progStr);
	if (!ast.complete) {
		//Error if parsing failed
		let es = `Failed to parse program ${fileName}:`;
		for (let i = 0; i < err.length; i++) {
			es += `\nError on line ${err[i].position.row + 1} at position ${err[i].position.col}: ${err[i].message}`;
		}
		return [null, es];
	}
	return [ast, null];
}