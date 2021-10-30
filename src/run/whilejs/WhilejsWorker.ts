import { BinaryTree, Interpreter } from "whilejs";
import { treeParser } from "@whide/tree-lang";
import {
	ErrorResponse,
	LoadedResponse,
	LoadRequest,
	ProgFinishResponse,
	WhileWorkerResponse
} from "./WhileJsWorkerTypes";
import { AST_PROG } from "whilejs/lib/types/ast";

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
		let prog: AST_PROG = req.prog;
		let macros: AST_PROG[] = req.macros;
		let tree: BinaryTree;
		try {
			tree = treeParser(req.tree);
		} catch (e) {
			_emitErr(e);
			return;
		}
		//Store the interpreter object for running
		interpreter = new Interpreter(prog, tree, {macros: macros});
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