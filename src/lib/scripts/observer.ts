import {
    folderStore,
    fileStore,
    tempStore,
    intersectionLog,
    folderSearchStore,
    fileSearchStore,
    states,
    preferences,
} from "$lib/scripts/stores.svelte";
import {
    FOLDER_MIME_TYPE,
    fetchMultiple,
    IMG_MIME_TYPE,
    searchHandler,
} from "$lib/scripts/utils";
import { getToken } from "$lib/scripts/login";

const delay = 500;
const timeouts = new WeakMap<Element, number>();

export const observer = new IntersectionObserver(
    (entries, observer) => {
        entries.forEach(async (entry) => {
            const element = entry.target;
            if (entry.isIntersecting) {
                if (timeouts.has(element)) {
                    clearTimeout(timeouts.get(element));
                }
                const timeoutId = setTimeout(() => {
                    if (entry.target.id.includes("FOOT")) {
                        if (states.searchMode) {
                            footInspectionSearch(entry.target.id);
                        } else {
                            footInspection(entry.target.id);
                        }
                        return;
                    } else {
                        childInspection(observer, entry);
                    }
                    timeouts.delete(element);
                }, delay);
                timeouts.set(element, timeoutId);
            } else {
                if (timeouts.has(element)) {
                    clearTimeout(timeouts.get(element));
                    timeouts.delete(element);
                }
            }
        });
    },
    {
        threshold: 0.1,
        rootMargin: "0px 0px 100px",
    }
);

async function childInspection(
    observer: IntersectionObserver,
    entry: IntersectionObserverEntry
) {
    let { id } = (entry.target as HTMLElement).dataset;
    if (!id) return;
    intersectionLog.add(id);
    observer.unobserve(entry.target);
}

async function footInspection(id: string) {
    let pageToken =
        id === "FOLDER-FOOT"
            ? folderStore.nextPageToken
            : fileStore.nextPageToken;
    if (!pageToken) return;
    let mimeType = id === "FOLDER-FOOT" ? FOLDER_MIME_TYPE : IMG_MIME_TYPE;
    let res = await fetchMultiple(
        {
            parent: tempStore.activeFolder!.id,
            mimeType: mimeType,
            pageToken: pageToken,
            hidden: id === "FOLDER-FOOT" ? preferences.showHidden : false,
        },
        getToken()
    );
    if (!res) return;
    pageToken = res?.nextPageToken;
    if (id === "FOLDER-FOOT") {
        folderStore.nextPageToken = pageToken;
        folderStore.files.push(...(res.files as DriveFolder[]));
    } else {
        fileStore.nextPageToken = pageToken;
        fileStore.files.push(...(res.files as DriveFile[]));
    }
}

async function footInspectionSearch(id: string) {
    let pageToken =
        id === "FOLDER-FOOT"
            ? folderSearchStore.nextPageToken
            : fileSearchStore.nextPageToken;
    if (!pageToken) return;
    let mimeType = id === "FOLDER-FOOT" ? FOLDER_MIME_TYPE : IMG_MIME_TYPE;
    let res = await searchHandler(
        { mimeType, search: states.searchValue, pageToken },
        getToken()
    );
    if (!res) return;
    pageToken = res?.nextPageToken;
    if (id === "FOLDER-FOOT") {
        folderSearchStore.nextPageToken = pageToken;
        folderSearchStore.files.push(...(res.files as DriveFolder[]));
    } else {
        fileSearchStore.nextPageToken = pageToken;
        fileSearchStore.files.push(...(res.files as DriveFile[]));
    }
}
