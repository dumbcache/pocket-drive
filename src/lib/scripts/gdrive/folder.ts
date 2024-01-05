import { get } from "svelte/store";
import { updateResource } from "./utils";
import { sessionTimeout } from "../shared/stores";

export const createFolder = async (
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
    return data;
};

export const updateFolder = async (
    name: string,
    id: string,
    parent: string,
    token: string
): Promise<any> => {
    const { status, data } = await updateResource(id, { name }, token);
    if (status !== 200) {
        return;
    }
    return data;
};

export const deleteFolder = async (
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
};
