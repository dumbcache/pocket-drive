import {
    folderStore,
    fileStore,
    tempStore,
    intersectionLog,
} from "$lib/scripts/stores.svelte";
import {
    FOLDER_MIME_TYPE,
    fetchMultiple,
    IMG_MIME_TYPE,
} from "$lib/scripts/utils";
import { getToken } from "$lib/scripts/login";

const debounceDelay = 700;
let debounceTimeout: number | null = null;

export const observer = new IntersectionObserver(
    (entries, observer) => {
        if (debounceTimeout) clearTimeout(debounceTimeout);

        debounceTimeout = setTimeout(() => {
            entries.forEach(async (entry) => {
                if (entry.isIntersecting) {
                    if (entry.target.id.includes("FOOT")) {
                        footInspection(entry.target.id);
                        return;
                    } else {
                        childInspection(observer, entry);
                    }
                } else {
                }
            });
        }, debounceDelay);
    },
    {
        threshold: 0.1,
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
