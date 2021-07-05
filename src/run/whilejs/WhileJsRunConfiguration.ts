import { AbstractRunner } from "@/run/AbstractRunner";
import { Writable } from "stream";
import treeConverter, { BinaryTree, ConversionResultType, stringify, treeParser } from "@whide/tree-lang";
import { ErrorType, Interpreter } from "whilejs";
import { fs } from "@/files/fs";
import { ENCODING_UTF8 } from "memfs/lib/encoding";

/**
 * Properties for the {@link WhileJsRunner} constructor.
 */
export interface WhileJsRunnerProps {
	/**
	 * Input expression to the program
	 */
	expression: string;
	/**
	 * Path to the file to run
	 */
	file: string;
	/**
	 * Output stream to write the output to
	 */
	output: Writable;
}

/**
 * Run a program using While.js.
 */
export class WhileJsRunner implements AbstractRunner {
	private _props: WhileJsRunnerProps;
	private _programString?: string;
	private _inputTree?: BinaryTree;

	constructor(props: WhileJsRunnerProps) {
		this._props = props;
	}

	async init(): Promise<void> {
		this._inputTree = treeParser(this._props.expression);
		this._programString = await fs.promises.readFile(this._props.file, ENCODING_UTF8);
	}

	run(): void {
		//Parse the program and create an interpreter
		let res: {success:true,interpreter:Interpreter}|{success:false,errors:ErrorType[]} = Interpreter.parse(this._programString!, this._inputTree!);

		if (!res.success) {
			//Show errors if parsing failed
			this._props.output.write(`Parse failed with ${res.errors.length} errors:`);
			for (let error of res.errors) {
				this._props.output.write(`Error (${error.position.row}:${error.position.col}): ${error.message}`);
			}
			return;
		}

		let interpreter = res.interpreter;

		//Display the input variable
		this._props.output.write(`In: ${stringify(treeConverter(this._inputTree!, 'any').tree)}\n`);

		//Run the program and read the output value
		let output: BinaryTree = interpreter.run();

		try {
			//Convert the outputted tree to a human readable format and display it
			let res: ConversionResultType = treeConverter(output, 'any');
			this._props.output.write(`Out: ${stringify(res.tree)}`);
		} catch (e) {
			//Error when converting the tree
			this._props.output.write(`error: ${e}`);
			return;
		}
	}
}
