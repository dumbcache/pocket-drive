import { writable } from "svelte/store";

export let folderStore = writable<GoogleFileResponse | undefined>();
export let fileStore = writable<GoogleFileResponse | undefined>();
export let recentStore = writable<{ name: string; id: string }[]>([]);
export let searchItems = writable<GoogleFile[] | undefined>();

export let isLoggedin = writable(false);
export let activeView = writable<"FILE" | "FOLDER">("FOLDER");

export let activeTimeout = writable(0);
export let sessionTimeout = writable(false);
export let activeRefreshTimeout = writable(0);
export let refreshTimeout = writable(false);
export let dataCacheName = writable("");

export let progress = writable(false);
export let mode = writable("");
export let activeParent = writable<{
    id: string;
    name: string;
    parents?: string[];
}>();
export let activeImage = writable<GoogleFile>();
export let dropItems = writable<DropItem[]>([]);
export let editItems = writable<GoogleFile[]>([]);

export let folderActionToggle = writable(false);
export let folderAction = writable<FolderAction | undefined>();
export let folderActionDetail = writable<FolderActionDetail | undefined>();
