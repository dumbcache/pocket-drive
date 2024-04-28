import { get, writable } from "svelte/store";

export const pocketStore = new Map();
export let pocketState = writable(null);

export let folderStore = writable<GoogleFileResponse | undefined>();
export let fileStore = writable<GoogleFileResponse | undefined>();
export let recentStore = writable<{ name: string; id: string }[]>([]);
export let searchItems = writable<GoogleFile[] | undefined>();

export let isLoggedin = writable(false);
export let activeView = writable<"FILE" | "FOLDER">("FOLDER");
export let preview = writable<"IMAGE" | "VIDEO">("IMAGE");
export let previewLoading = writable(false);

export let activeTimeout = writable(0);
export let sessionTimeout = writable(false);
export let activeRefreshTimeout = writable(0);
export let refreshTimeout = writable(false);
export let dataCacheName = writable("");

export let autosave = writable(false);
export let refresh = writable(false);
export let progress = writable(false);
export let editProgress = writable(false);
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

export function storeSnap(
    parent: string,
    files?: GoogleFileResponse,
    folders?: GoogleFileResponse
) {
    parent ?? (parent = get(activeParent).id);
    folders ?? (folders = get(folderStore));
    files ?? (files = get(fileStore));
    pocketStore.set(parent, {
        folders,
        files,
    });
}
