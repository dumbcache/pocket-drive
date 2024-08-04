import { getContext, setContext } from "svelte";
import { get, writable } from "svelte/store";

export const HOME_PATH = "home";
export const CACHE_DATA = "pd-data";
export const pocketStore = new Map();
export const imageFetchLog = new Set();

export let pocketState = writable<null | string>(null);
export function setPocketState(val?: string) {
    const state = val && typeof val === "string" ? val : HOME_PATH;
    window.localStorage.setItem("pocketState", state);
    pocketState.set(state);
}
export function getPocketState(): string {
    return (
        get(pocketState) ||
        window.localStorage.getItem("pocketState") ||
        HOME_PATH
    );
}

export const progressStore = writable({
    total: 0,
    success: 0,
    fail: 0,
});
export function updateProgressStore(t = 0, s = 0, f = 0) {
    progressStore.update((val) => {
        return {
            total: val.total + t,
            success: val.success + s,
            fail: val.fail + f,
        };
    });
}

export let profile = writable(false);
export let activeView = writable<"FILE" | "FOLDER">("FOLDER");
export function setViewContext() {
    setContext("view", activeView);
}
export function getViewContext(): typeof activeView {
    return getContext("view");
}

export let folderStore = writable<GoogleDriveResponse | undefined>();
export let fileStore = writable<GoogleDriveResponse | undefined>();
export let recentStore = writable<{ name: string; id: string }[]>([]);
export let searchItems = writable<DriveFile[] | undefined>();

export let refresh = writable(false);
export let starred = writable(false);
export let autosave = writable(false);
export let progress = writable(false);
export let mask = writable(false);
export let fetchAll = writable(false);
export let mode = writable("");
export let shortcuts = writable(false);
export let activeParent = writable<DriveFolder>();
export let activeImage = writable<DriveFile>();
export let dropItems = writable<DropItem[]>([]);
export let editItems = writable<DriveFile[]>([]);

export let folderActionToggle = writable(false);
export let folderAction = writable<FolderAction | undefined>();
export let folderActionDetail = writable<FolderActionDetail | undefined>();

export function storeSnap(
    files?: GoogleDriveResponse,
    folders?: GoogleDriveResponse,
    activeFolder?: DriveFolder
) {
    try {
        activeFolder ??= get(activeParent);
        folders ??= get(folderStore);
        files ??= get(fileStore);
        if (folders && files && parent) {
            pocketStore.set(parent, {
                folders,
                files,
                info: activeFolder,
            });
        }
    } catch (error) {
        console.warn("storeSnap function error", error);
    }
}

export class LRUCache {
    cache: Map<any, any>;
    limit: number;
    constructor(limit: number) {
        this.limit = limit;
        this.cache = new Map();
    }

    get(key: string) {
        if (!this.cache.has(key)) return null;
        const value = this.cache.get(key);
        this.delete(key);
        this.cache.set(key, value);
        return value;
    }

    set(key: string, value: string) {
        if (this.cache.has(key)) {
            this.delete(key);
        } else if (this.cache.size >= this.limit) {
            this.delete(this.cache.keys().next().value);
        }
        this.cache.set(key, value);
    }

    has(key: string) {
        return this.cache.has(key);
    }

    delete(key: string) {
        let preview = document.querySelector(".preview");
        let ele = preview?.querySelector(`[data-id="${key}"]`) as
            | HTMLImageElement
            | HTMLVideoElement;
        if (ele && ele.dataset.src) {
            ele.src = ele.dataset.src;
        }
        URL.revokeObjectURL(this.cache.get(key));
        this.cache.delete(key);
    }

    clear() {
        this.cache.forEach((val) => {
            URL.revokeObjectURL(val);
        });
        this.cache.clear();
    }
}

export let imageCache = new LRUCache(50);
