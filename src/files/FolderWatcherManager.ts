import path from "path";
import { fs } from "@/files/fs";
import { FSWatcher } from "fs";

type FileWatcherCallbackType = (event: 'change'|'rename', filepath: string) => void;

class FolderWatcher {
	private _filepath: string;
	private _watchers: Set<FileWatcherCallbackType>;
	private _fswatcher: FSWatcher|undefined;

	constructor(filepath: string, watchers?: FileWatcherCallbackType[]) {
		this._filepath = path.normalize(filepath);
		this._watchers = new Set<FileWatcherCallbackType>(watchers || []);

		this.open();
	}

	public get watchers(): Set<FileWatcherCallbackType> {
		return this._watchers;
	}

	public get watcherObj(): FSWatcher|undefined {
		return this._fswatcher;
	}

	public addCallback(watcher: FileWatcherCallbackType) {
		this.watchers.add(watcher);
	}

	public removeCallback(watcher: FileWatcherCallbackType) {
		this.watchers.delete(watcher);
	}

	public close() {
		if (this._fswatcher) {
			this._fswatcher.close();
			this._fswatcher = undefined;
		}
	}

	public open() {
		if (this.watcherObj) this.close();
		this._fswatcher = fs.watch(this._filepath, this._onWatcherTrigger);
	}

	private _onWatcherTrigger = (event: 'change'|'rename') => {
		// console.log('here', this.watchers);
		for (let watcher of this.watchers) {
			// console.log('watcher ', watcher);
			watcher(event, this._filepath);
		}
	}
}

export default class FolderWatcherManager {
	private static readonly _watcherMap: Map<string, FolderWatcher> = new Map<string, FolderWatcher>();

	constructor() {
		// this._watcherMap = new Map<string, FolderWatcher>();
	}

	public static watch(filepath: string, cb: FileWatcherCallbackType): void {
		let normalizedPath = path.normalize(filepath);
		let watcher = this._watcherMap.get(normalizedPath);

		if (!watcher) {
			watcher = new FolderWatcher(normalizedPath, [cb]);
			this._watcherMap.set(normalizedPath, watcher);
		} else {
			watcher.addCallback(cb);
		}
	}

	public static unwatch(filepath: string, cb?: FileWatcherCallbackType): void {
		let normalizedPath = path.normalize(filepath);
		let watcher = this._watcherMap.get(normalizedPath);

		if (watcher) {
			if (cb) {
				watcher.removeCallback(cb);
				watcher.close();
			} else {
				// this._removeWatcher(filepath, watcher);
				watcher.close();
				this._watcherMap.delete(filepath);
			}
		}
	}

	public static cleanUp(): void {
		this._watcherMap.forEach((watcher, filepath) => {
			if (watcher.watchers.size === 0) {
				watcher.close();
				this._watcherMap.delete(filepath);
			}
		})
	}
}