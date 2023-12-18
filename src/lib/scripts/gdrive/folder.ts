import { get } from "svelte/store";
import { updateResource } from "./utils";
import { fetchFiles } from "$lib/scripts/gdrive/utils";
import { sessionTimeout } from "../shared/stores";
import { activeDirs } from "../stores";

export const createDir = async (
    name: string,
    parent: string,
    token: string
): Promise<any> => {
    const url = "https://www.googleapis.com/drive/v3/files/";
    let req = await fetch(url, {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
            name,
            mimeType: "application/vnd.google-apps.folder",
            parents: [parent],
        }),
    });
    let { status, statusText } = req;
    let data = (await req.json()) as CreateResourceResponse;
    if (status !== 200) {
        console.log(
            `error while creating root dir ${status} ${statusText}`,
            data
        );
        if (status === 401) {
            get(sessionTimeout) === false && sessionTimeout.set(true);
            return;
        }
    }
    let old = get(activeDirs) ?? [];
    old = [...old, { name: data.name, id: data.id }];
    activeDirs.set(old.sort((a, b) => a.name.localeCompare(b.name)));
    fetchFiles(parent, "dirs", 1000, true);
};

export const updateDir = async (
    name: string,
    id: string,
    parent: string,
    token: string
): Promise<any> => {
    const { status, data } = await updateResource(id, { name }, token);
    if (status !== 200) {
        return;
    }
    let old = get(activeDirs)?.filter((img) => img.id !== id) ?? [];
    old = [...old, { name: data.name, id: data.id }];
    activeDirs.set(old.sort((a, b) => a.name.localeCompare(b.name)));
    fetchFiles(parent, "dirs", 1000, true);
};

export const deleteDir = async (
    id: string,
    parent: string,
    token: string
): Promise<any> => {
    const url = `https://www.googleapis.com/drive/v3/files/${id}`;
    let req = await fetch(url, {
        method: "DELETE",
        headers: {
            Authorization: `Bearer ${token}`,
        },
    });
    let { status, statusText } = req;
    if (status !== 204) {
        console.log(
            `error while deleting root dir ${status} ${statusText}`,
            await req.text()
        );
        if (status === 401) {
            get(sessionTimeout) === false && sessionTimeout.set(true);
            return;
        }
    }
    let old = get(activeDirs)?.filter((img) => img.id !== id) ?? [];
    old.length === 0 ? activeDirs.set(undefined) : activeDirs.set(old);
    fetchFiles(parent, "dirs", 1000, true);
};

export async function fetchDirs(
    parent: string,
    cache: Boolean = false
): Promise<void> {
    activeDirs.set(undefined);
    return new Promise((resolve, reject) => {
        fetchFiles(parent!, "dirs", 1000, cache)
            .then(async (dirs) => {
                activeDirs.set(dirs?.files);
                if (cache) {
                    for (let dir of dirs!.files) {
                        fetchFiles(dir.id, "covers", 3, cache);
                    }
                }
                resolve();
                return;
            })
            .catch((status) => reject(status));
    });
}
