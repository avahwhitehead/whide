import localforage from "localforage";

const APP_NAME = "WhideDb";

export interface DataStoreProps {
	dbName: string;
	description: string;
}

/**
 * Wrapper around a persistent data store library to allow simpler access to its methods
 */
export default class PersistentDataStore {
	private _props: DataStoreProps;
	private _store: LocalForage;

	public constructor(props: DataStoreProps) {
		//Save the props values
		this._props = props;

		//Create a new data store
		this._store = localforage.createInstance({
			driver: localforage.INDEXEDDB,
			name: APP_NAME,
			version: 1.0,
			storeName: props.dbName,
			description: props.description,
		});
	}

	/**
	 * Write the {@code data} object to the store, associated to {@code key}.
	 * Data types are persisted during across read/writes.
	 * @param key	The string key to associate the data to
	 * @param data	The data object to store
	 */
	public async write(key: string, data: any) : Promise<void> {
		return await this._store.setItem(key, data);
	}

	/**
	 * Get the data stored against {@code key} in the store.
	 * Data types are persisted during across read/writes.
	 * @param key	The key string to read the data from
	 * @returns	The data stored against the key, or `null` if it doesn't exist
	 */
	public async read(key: string) : Promise<any> {
		return await this._store.getItem(key);
	}

	/**
	 * Remove this key and its value from the store.
	 * @param key	The key string to delete
	 */
	public async delete(key: string) : Promise<void> {
		return await this._store.removeItem(key);
	}

	/**
	 * Remove this key and its value from the store.
	 * @returns	List of all the keys in the store
	 */
	public async keys() : Promise<string[]> {
		return await this._store.keys();
	}

	/**
	 * Check if a key exists in the store.
	 * @param key	The key string to check
	 * @returns	{@code true} if the key exists, {@code false} otherwise
	 */
	public async exists(key: string) : Promise<boolean> {
		return (await this.read(key)) !== null;
	}
}