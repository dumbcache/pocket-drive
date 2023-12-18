import { writable } from "svelte/store";

export let isLoggedin = writable(false);
export let activeTimeout = writable(0);
export let sessionTimeout = writable(false);
export let activeRefreshTimeout = writable(0);
export let refreshTimeout = writable(false);
export let dataCacheName = writable("");

export let searchItems = writable<GoogleFile[] | undefined>();
