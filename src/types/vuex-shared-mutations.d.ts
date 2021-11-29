declare module 'vuex-shared-mutations' {
	interface MutationsSharerOptions<T>{
		/**
		 * Either:
		 * 	* An array of mutation types to be shared
		 * 	* A predicate function which accepts a whole mutation object (and state) and returns true if this mutation should be shared.
		 */
		predicate: string[] | ((mutation: { type: string, payload: any }, state: T) => boolean);

		strategy?: {
			/**
			 * plugin will subscribe to changes events using this function
			 */
			addEventListener(fn: function): any,
			/**
			 * plugin will call this function when data should be shared
			 */
			share(any): any
		}
	}
	export default function createMutationsSharer<T>(options?: MutationsSharerOptions<T>): Plugin<T>;
}
