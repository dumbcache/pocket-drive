import { getContext, setContext } from "svelte";
import { get, writable } from "svelte/store";

export const HOME_PATH = "home";
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
export let preferences = writable<Preferences>({
    showFileNames: false,
    disableWebp: false,
});
export function updatePreferences(p: Preferences) {
    preferences.update((val) => {
        return {
            ...val,
            ...p,
        };
    });
}

export let activeView = writable<"FILE" | "FOLDER">("FOLDER");
export function setViewContext() {
    setContext("view", activeView);
}
export function getViewContext(): typeof activeView {
    return getContext("view");
}

export let folderStore = writable<GoogleFileResponse | undefined>();
export let fileStore = writable<GoogleFileResponse | undefined>();
export let recentStore = writable<{ name: string; id: string }[]>([]);
export let searchItems = writable<GoogleFile[] | undefined>();

export let isLoggedin = writable(false);
export let preview = writable<"IMAGE" | "VIDEO">("IMAGE");
export let theme = writable<"dark" | "">("");

export let activeTimeout = writable(0);
export let sessionTimeout = writable(false);
export let dataCacheName = writable("");

export let refresh = writable(false);
export let starred = writable(false);
export let autosave = writable(false);
export let progress = writable(false);
export let mask = writable(false);
export let fetchAll = writable(false);
export let mode = writable("");
export let shortcuts = writable(false);
export let activeParent = writable<{
    id: string;
    name: string;
    parents?: string[];
}>();
export let activeImage = writable<GoogleFile>();
export let activeFile = writable<string>();
export let dropItems = writable<DropItem[]>([]);
export let editItems = writable<GoogleFile[]>([]);

export let folderActionToggle = writable(false);
export let folderAction = writable<FolderAction | undefined>();
export let folderActionDetail = writable<FolderActionDetail | undefined>();

export function storeSnap(
    parent?: string,
    files?: GoogleFileResponse,
    folders?: GoogleFileResponse
) {
    try {
        parent ?? (parent = get(activeParent).id);
        if (parent) {
            folders ?? (folders = get(folderStore));
            files ?? (files = get(fileStore));
            pocketStore.set(parent, {
                folders,
                files,
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
