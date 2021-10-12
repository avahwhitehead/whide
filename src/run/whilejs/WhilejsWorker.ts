import { BinaryTree, ErrorType, Interpreter } from "whilejs";
import { treeParser } from "@whide/tree-lang";
import {
	ErrorResponse,
	LoadedResponse,
	LoadRequest,
	ProgFinishResponse,
	WhileWorkerResponse
} from "./WhileJsWorkerTypes";

function _emit(data: WhileWorkerResponse): void {
	(self as any as Worker).postMessage(data);
}
function _emitErr(msg: string): void {
	const res: ErrorResponse = {
		type: 'error',
		msg,
	};
	_emit(res);
}
function _emitDone(tree: BinaryTree) {
	const msg: ProgFinishResponse = {
		type: 'end',
		res: tree,
	};
	_emit(msg);
}
function _emitLoaded() {
	const msg: LoadedResponse = {
		type: 'loaded',
	};
	_emit(msg);
}

let interpreter: Interpreter|undefined = undefined;

// We send a message back to the main thread
(self as any as Worker).addEventListener("message", (event) => {
	if (event.data.op === 'load') {
		//Typed reference to the passed data
		let req: LoadRequest = event.data;

		//Parse the provided tree to an object
		let prog: string = req.prog;
		let tree: BinaryTree;
		try {
			tree = treeParser(req.tree);
		} catch (e) {
			_emitErr(e);
			return;
		}

		//Parse the program and create an interpreter
		let res: {success:true,interpreter:Interpreter}|{success:false,errors:ErrorType[]} = Interpreter.parse(prog, tree);

		if (!res.success) {
			//Show errors if parsing failed
			let output: string = `Program parse failed with ${res.errors.length} errors:`;
			for (let error of res.errors) {
				output += `\nError (${error.position.row}:${error.position.col}): ${error.message}`;
			}
			_emitErr(output);
			return;
		}

		//Store the interpreter object for running
		interpreter = res.interpreter;
		//Emit the loaded event
		_emitLoaded();
	} else if (event.data.op === 'run') {
		//Check an interpreter has been created
		if (!interpreter) {
			_emitErr('No program loaded');
		} else {
			//Run the program and emit the output value
			let output: BinaryTree = interpreter.run();
			_emitDone(output);
		}
	} else {
		_emitErr(`Unknown request operation: '${event.data.op}'`);
	}
});