import { browser } from "$app/environment";
import { get } from "svelte/store";
import {
    activeRefreshTimeout,
    activeTimeout,
    dataCacheName,
    sessionTimeout,
    isLoggedin,
} from "./stores";
import { goto } from "$app/navigation";

export const colorPalette = {
    ChocolateIceCream: "#ac725e",
    OldBrickRed: "#d06b64",
    Cardinal: "#f83a22",
    WildStraberries: "#fa573c",
    MarsOrange: "#ff7537",
    YellowCab: "#ffad46",
    Spearmint: "#42d692",
    VernFern: "#16a765",
    Asparagus: "#7bd148",
    SlimeGreen: "#b3dc6c",
    DesertSand: "#fbe983",
    Macaroni: "#fad165",
    SeaFoam: "#92e1c0",
    Pool: "#9fe1e7",
    Denim: "#9fc6e7",
    RainySky: "#4986e7",
    BlueVelvet: "#9a9cff",
    PurpleDino: "#b99aff",
    Mouse: "#8f8f8f",
    MountainGrey: "#cabdbf",
    Earthworm: "#cca6ac",
    BubbleGum: "#f691b2",
    PurpleRain: "#cd74e6",
    ToyEggplant: "#a47ae2",
};

export function isValidUrl(url: string) {
    try {
        new URL(url);
        return url;
    } catch (err) {
        return "";
    }
}

export function getToken() {
    return window.localStorage.getItem("token");
}

export function isTokenExpired() {
    return Date.now() > Number(window.localStorage.getItem("sessionTime"));
}

export function isRefreshNeeded() {
    return Date.now() > Number(window.localStorage.getItem("refreshTime"));
}

export function checkLoginStatus() {
    if (browser) {
        return (
            Boolean(window.localStorage.getItem("token")) && !isTokenExpired()
        );
    }
}

export async function clearFiles() {
    (await caches.keys()).forEach(
        (key) => key.startsWith("pd-") && caches.delete(key)
    );
    window.localStorage.clear();
}

export async function signUserOut(e?: Event) {
    e?.stopPropagation();
    await clearFiles();
    isLoggedin.set(false);
    console.log("logging user out");
    goto("/");
}

export async function setCache(refresh: Boolean) {
    for (let key of await caches.keys()) {
        if (key.startsWith("pd-data")) {
            dataCacheName.set(key);
            refresh && caches.delete(key);
        }
    }
}

export function checkRefreshTimeout() {
    let time = Number(window.localStorage.getItem("refreshTime")) - Date.now();
    time > 0 &&
        activeRefreshTimeout.set(
            setTimeout(() => {
                if (isRefreshNeeded()) {
                    setCache(true);
                } else {
                    clearTimeout(get(activeRefreshTimeout));
                    checkRefreshTimeout();
                    setCache(false);
                }
            }, time)
        );
}
export function checkSessionTimeout() {
    let time = Number(window.localStorage.getItem("sessionTime")) - Date.now();
    time > 0 &&
        activeTimeout.set(
            setTimeout(() => {
                if (isTokenExpired()) {
                    sessionTimeout.set(true);
                } else {
                    clearTimeout(get(activeTimeout));
                    checkSessionTimeout();
                }
            }, time)
        );
}

export function setSessionTimeout(expires: number) {
    window.localStorage.setItem(
        "sessionTime",
        String(Date.now() + expires * 1000)
    );
    sessionTimeout.set(false);
    checkSessionTimeout();
}

export function setRefreshTimeout() {
    let time = Number(window.localStorage.getItem("refreshTime")) - Date.now();
    if (time > 0) return;
    window.localStorage.setItem(
        "refreshTime",
        String(Date.now() + 24 * 60 * 60 * 1000)
    );
    checkRefreshTimeout();
}
