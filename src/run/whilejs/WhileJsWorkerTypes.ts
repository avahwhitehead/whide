import { BinaryTree } from "whilejs";
import { AST_PROG } from "whilejs/lib/types/ast";

export interface LoadRequest {
	op: 'load',
	prog: AST_PROG,
	tree: string,
	macros: AST_PROG[]
}

export interface RunRequest {
	op: 'run',
}

export type WhileWorkerRequest = LoadRequest|RunRequest;


export interface ErrorResponse {
	type: 'error',
	msg: string,
}

export interface LoadedResponse {
	type: 'loaded',
}

export interface ProgFinishResponse {
	type: 'end',
	res: BinaryTree,
}

export type WhileWorkerResponse = ErrorResponse|ProgFinishResponse|LoadedResponse;
