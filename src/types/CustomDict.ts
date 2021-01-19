/**
 * A wrapper interface to simplify mapping strings to objects
 */
export interface CustomDict<T> {
	[key: string]: T;
}