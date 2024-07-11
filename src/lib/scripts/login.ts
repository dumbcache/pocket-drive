import {
    activeTimeout,
    HOME_PATH,
    isLoggedin,
    pocketState,
} from "$lib/scripts/stores";
import { get } from "svelte/store";
import { PUBLIC_KRAB_CLIENT_ID } from "$env/static/public";
import {
    setSessionTimeout,
    // setRefreshTimeout,
    createRootFolder,
} from "$lib/scripts/utils";
import { goto } from "$app/navigation";

export let googleClient = (() => {
    let client = null;

    async function handleGoogleSignIn(tokenResponse: TokenResponse) {
        let accessToken = tokenResponse.access_token;
        window.localStorage.setItem("token", accessToken);
        clearTimeout(get(activeTimeout));
        setSessionTimeout(tokenResponse.expires_in);
        if (!window.localStorage.getItem("root")) {
            const res = await fetch(
                `https://www.googleapis.com/drive/v3/files?&pageSize=1&fields=files(id,name)&orderBy=createdTime`,
                {
                    headers: { authorization: `Bearer ${accessToken}` },
                }
            );
            const { files } = await res.json();
            if (files.length !== 0) {
                window.localStorage.setItem("root", files[0].id);
            } else {
                const { id } = await createRootFolder(accessToken);
                window.localStorage.setItem("root", id);
            }
        }
        if (get(isLoggedin)) return;
        isLoggedin.set(true);
        let state = get(pocketState) || HOME_PATH;
        goto(`/${state}`);
    }

    function initClient() {
        client = window.google.accounts.oauth2.initTokenClient({
            client_id: PUBLIC_KRAB_CLIENT_ID,
            scope: "https://www.googleapis.com/auth/drive.file",
            callback: handleGoogleSignIn,
        });
    }

    function loadGSIScript() {
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

    function requestToken() {
        client.requestAccessToken();
    }

    return {
        loadGSIScript,
        requestToken,
    };
})();
