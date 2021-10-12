import { BinaryTree } from "whilejs";

export interface LoadRequest {
	op: 'load',
	prog: string,
	tree: string,
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
