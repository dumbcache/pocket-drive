import { browser } from "$app/environment";
import { SvelteSet } from "svelte/reactivity";

export const HOME_PATH = "home";
export const PRIVATE_PATH = "private";
export const DATA_CACHE = "pd-data";
export const TEMP_CACHE = "pd-temp";
export const imageFetchLog = new Set();
export let intersectionLog = new SvelteSet<string>();

export const pocketStore = new Map();
export function storeSnap(
    files?: GoogleDriveResponse<DriveFile>,
    folders?: GoogleDriveResponse<DriveFolder>,
    activeFolder?: DriveFolder
) {
    try {
        if (folders && files && activeFolder) {
            pocketStore.set(activeFolder.id, {
                folders,
                files,
                activeFolder,
            });
        }
    } catch (error) {
        console.warn("storeSnap function error", error);
    }
}
class AppStore<T> {
    nextPageToken = $state<string>();
    files = $state<T[]>([]);

    set(data: GoogleDriveResponse<T>) {
        this.nextPageToken = data?.nextPageToken;
        this.files = data.files;
    }
    get() {
        return {
            nextPageToken: this.nextPageToken,
            files: this.files,
        };
    }
}
export const fileStore = new AppStore<DriveFile>();
export const folderStore = new AppStore<DriveFolder>();
export const fileSearchStore = new AppStore<DriveFile>();
export const folderSearchStore = new AppStore<DriveFolder>();
export let viewStore = new AppStore<DriveFile>();
export function setViewStore(to?: "SEARCH") {
    viewStore = to === "SEARCH" ? fileSearchStore : fileStore;
}

class TempStore {
    activeFolder = $state<ActiveFolder>({});
    activeFile = $state<ActiveFile>({});
    folderAction = $state<FolderAction>({});
    dropItems = $state<DropItem[]>([]);
    dropURL = $state("");
}
export const tempStore = new TempStore();

class ProgressStore {
    total = $state(0);
    success = $state(0);
    fail = $state(0);

    set(total: number, success: number, fail: number) {
        this.total = total;
        this.success = success;
        this.fail = fail;
    }
    update(total: number = 0, success: number = 0, fail: number = 0) {
        this.total = this.total + total;
        this.success = this.success + success;
        this.fail = this.fail + fail;
    }
}
export let progressStore = new ProgressStore();

class AppPreferences {
    showFileNames = $state(false);
    disableWebp = $state(false);
    showHidden = $state(false);
    theme = $state<"DARK" | "">("");

    constructor() {
        if (browser) {
            let pref = localStorage.getItem("preferences");
            if (pref) {
                const data = JSON.parse(pref);
                data && this.set(data);
            }
            this.setTheme();
        }
    }

    toggleShowFileNames() {
        this.showFileNames = !this.showFileNames;
    }

    toggleWebp() {
        this.disableWebp = !this.disableWebp;
    }

    toggleTheme() {
        this.theme = this.theme === "DARK" ? "" : "DARK";
        this.setTheme();
        this.saveToLocal();
    }

    toggleHidden() {
        this.showHidden = !this.showHidden;
        this.saveToLocal();
        window.location.reload();
    }

    setTheme() {
        const root = document.documentElement;
        if (window.CSS.supports("color", "light-dark(#000,#fff)")) {
            switch (this.theme) {
                case "DARK":
                    root.style.setProperty("color-scheme", "dark");
                    break;
                default:
                    root.style.setProperty("color-scheme", "light");
                    break;
            }
            return;
        }
        let dark = root.classList.contains("dark");
        switch (this.theme) {
            case "DARK":
                if (!dark) root.classList.add("dark");
                break;
            default:
                if (dark) root.classList.remove("dark");
                break;
        }
    }

    set({ showFileNames, disableWebp, theme, showHidden }: Preferences) {
        this.showFileNames = showFileNames;
        this.disableWebp = disableWebp;
        this.showHidden = showHidden;
        this.theme = theme;
    }

    get(): Preferences {
        return {
            showFileNames: this.showFileNames,
            disableWebp: this.disableWebp,
            showHidden: this.showHidden,
            theme: this.theme,
        };
    }

    saveToLocal() {
        window.localStorage.setItem("preferences", JSON.stringify(this.get()));
    }
}
export const preferences = new AppPreferences();

class AppStates {
    view = $state<"FILE" | "FOLDER">("FOLDER");
    mode = $state<Mode>("");
    searchMode = $state(false);
    starred = $state(false);
    profile = $state(false);
    refresh = $state(false);
    fetchall = $state(false);
    autosave = $state(false);
    drop = $state(false);
    progress = $state(false);
    shortcuts = $state(false);
    searchValue = $state("");
    mask = $state(false);
    sessionTimeout = $state<Boolean>();
    sessionTimeoutId = $state<number>();
    pocketState = $state<string | null>(null);
    offline = $state(false);

    setPocketState(val: string) {
        const state = val && typeof val === "string" ? val : HOME_PATH;
        window.localStorage.setItem("pocketState", val);
        this.pocketState = state;
    }
    getPocketState(): string {
        return (
            this.pocketState ||
            window.localStorage.getItem("pocketState") ||
            HOME_PATH
        );
    }
}
export const states = new AppStates();

class LRUCache {
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
