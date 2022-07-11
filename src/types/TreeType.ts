export interface TreeType {
	name: any;
	list?: boolean,
	error?: boolean,
	errorMsg?: string,
	children?: TreeType[];
}