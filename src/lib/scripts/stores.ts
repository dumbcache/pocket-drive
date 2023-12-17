import { writable, type Writable } from "svelte/store";

export let activeParentId = writable("");
export let activeParentName = writable("");
export let activeGrandParentId = writable("");

export let tempImgs = writable<GoogleFile[] | undefined>();
export let tempDirs = writable<GoogleFile[] | undefined>();
export let activeImgs = writable<GoogleFile[] | undefined>();
export let activeDirs = writable<GoogleFile[] | undefined>();

export let recents = writable<{ name: string; id: string }[]>([]);
export let searchItems = writable<GoogleFile[] | undefined>();
export let globalSearch = writable(false);
export let reverseActive = writable(false);
export let favoritesActive = writable(false);

export let editMode = writable(false);
export let mode = writable("");
export let editItems = writable<string[]>([]);
export let editConfirm = writable(false);
export let editProgress = writable(false);
export let selectAll = writable(false);
export let selectedCount = writable(0);
export let isLoggedin = writable(false);
export let activeTimeout = writable(0);
export let sessionTimeout = writable(false);
export let activeRefreshTimeout = writable(0);
export let refreshTimeout = writable(false);
export let dataCacheName = writable("");
export let refreshClicked = writable(false);
export let dirCreateToggle = writable(false);
export let autosave = writable(false);

export let shortcuts = writable(false);
export let previewItem: Writable<PreviewItem | undefined> = writable(undefined);
export let blobLocations = writable({});
export let dropMini = writable(false);
export let dropFull = writable(false);
export let dropItems: Writable<DropItem[]> = writable([]);
export let touchCoords: Writable<TouchCoords> = writable({});

export let view = writable(false);

export let arr = writable([1, 3, 5]);
