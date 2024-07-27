import {
    activeTimeout,
    getPocketState,
    HOME_PATH,
    isLoggedin,
} from "$lib/scripts/stores";
import { get } from "svelte/store";
import { PUBLIC_KRAB_CLIENT_ID } from "$env/static/public";
import { setSessionTimeout, createRootFolder } from "$lib/scripts/utils";
import { goto } from "$app/navigation";
import { browser } from "$app/environment";

let client = null;
let token: string = "";
if (browser) {
    token = window.localStorage.getItem("token") || "";
}

async function handleGoogleSignIn(tokenResponse: TokenResponse) {
    token = tokenResponse.access_token;
    window.localStorage.setItem("token", token);
    clearTimeout(get(activeTimeout));
    setSessionTimeout(tokenResponse.expires_in);
    if (!window.localStorage.getItem("root")) {
        const res = await fetch(
            `https://www.googleapis.com/drive/v3/files?&pageSize=1&fields=files(id,name)&orderBy=createdTime`,
            {
                headers: { authorization: `Bearer ${token}` },
            }
        );
        const { files } = await res.json();
        if (files.length !== 0) {
            window.localStorage.setItem("root", files[0].id);
        } else {
            const { id } = await createRootFolder(token);
            window.localStorage.setItem("root", id);
        }
    }
    if (get(isLoggedin)) return;
    isLoggedin.set(true);
    let state = getPocketState() || HOME_PATH;
    goto(`/${state}`, { replaceState: true });
}

function initClient() {
    if (!browser) return;
    client = window.google.accounts.oauth2.initTokenClient({
        client_id: PUBLIC_KRAB_CLIENT_ID,
        scope: "https://www.googleapis.com/auth/drive.file",
        callback: handleGoogleSignIn,
    });
}

export function loadGSIScript() {
    const src = "https://accounts.google.com/gsi/client";
    const header = document.querySelector("head");
    const gsiIfExists = header?.querySelector(`script[src='${src}']`);
    if (gsiIfExists) header?.removeChild(gsiIfExists);
    const script = document.createElement("script");
    script.src = src;
    script.onload = initClient;
    script.onerror = (e) => console.log(e);
    header?.append(script);
}

export function requestToken() {
    client.requestAccessToken();
}

export function getToken() {
    return token;
}

export function clearToken() {
    token = null;
    window.localStorage.removeItem("token");
}
