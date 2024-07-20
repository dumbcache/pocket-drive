<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Drop from "$lib/components/drops/Drop.svelte";
    import {
        signUserOut,
        updateRecents,
        setSessionTimeout,
    } from "$lib/scripts/utils";
    import { onMount } from "svelte";
    import {
        dropItems,
        isLoggedin,
        mode,
        pocketStore,
        sessionTimeout,
        profile,
        refresh,
        preferences,
        shortcuts,
    } from "$lib/scripts/stores";
    import { googleClient } from "$lib/scripts/login";
    import { goto } from "$app/navigation";
    import { previewAndSetDropItems } from "$lib/scripts/image";
    import ProgressBar from "$lib/components/utils/ProgressBar.svelte";
    import Profile from "$lib/components/profile/Profile.svelte";
    import Shortcuts from "$lib/components/Shortcuts.svelte";

    let draggedOver = false;

    export function imgDropHandler(e: DragEvent) {
        e.preventDefault();
        draggedOver = false;
        let files = e.dataTransfer?.files;
        if (files) {
            previewAndSetDropItems(files);
        }
    }

    function signoutHandler() {
        isLoggedin.set(false);
        signUserOut();
        goto("/");
    }

    function handleUnload(e) {
        if ($dropItems.length > 0) {
            e.preventDefault();
        }
        window.sessionStorage.setItem(
            "pocketStore",
            JSON.stringify(Array.from(pocketStore))
        );
        return true;
    }

    function handleSession(e) {
        try {
            if (e.key === "token") {
                if (e.newValue) {
                    sessionTimeout.set(false);
                } else {
                    sessionTimeout.set(true);
                }
                return;
            }
            if (e.key === "preferences") {
                e.newValue && preferences.set(JSON.parse(e.newValue));
            }
        } catch (error) {
            console.warn(error);
        }
    }

    onMount(async () => {
        try {
            await fetch("https://jsonplaceholder.typicode.com");
            updateRecents();
            setSessionTimeout();
            googleClient.loadGSIScript();
        } catch (error) {
            console.warn(error);
        }
    });
</script>

<svelte:window
    on:keydown
    on:beforeunload={handleUnload}
    on:storage={handleSession}
/>

<div
    role="group"
    class="layout {draggedOver === true ? 'dragover' : ''}"
    on:dragstart|preventDefault
    on:dragover|preventDefault={(e) => {
        draggedOver = true;
    }}
    on:dragenter={(e) => {
        draggedOver = true;
    }}
    on:dragleave={(e) => {
        draggedOver = false;
    }}
    on:drop={imgDropHandler}
>
    {#if $mode !== "edit"}
        <Header />
    {/if}
    <slot />
    {#if $dropItems.length > 0}
        <Drop />
    {/if}
    {#if $profile}
        <Profile />
    {/if}
    {#if $shortcuts}
        <Shortcuts />
    {/if}
    <ProgressBar />
    {#if $sessionTimeout}
        <div class="session-notify" on:wheel|preventDefault>
            <div class="session-wrapper">
                <p>Your session has been expired. Click login to continue</p>
                <div class="button-wrapper">
                    <button class="cancel" on:click={signoutHandler}
                        >cancel</button
                    >
                    <button class="login" on:click={googleClient.requestToken}
                        >login</button
                    >
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .layout {
        display: flex;
        background: inherit;
    }

    .session-notify {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        display: grid;
        place-content: center;
        z-index: 100;
        font-size: var(--size-smaller);
        background-color: var(--color-backdrop);
        /* backdrop-filter: blur(0.1rem);
        -webkit-backdrop-filter: blur(0.1rem); */
    }
    .session-wrapper {
        display: flex;
        flex-flow: column;
        gap: 2rem;
        padding: 5rem;
        border-radius: 1rem;
        box-shadow: 0 0 50px -10px var(--color-black);
        background-color: var(--color-bg-one);
    }

    p {
        width: fit-content;
        margin: auto;
    }
    .button-wrapper {
        display: flex;
        gap: 1rem;
        justify-content: end;
    }
    button {
        padding: 0.5rem;
        width: 8rem;
        border-radius: 0.5rem;
        background-color: var(--color-bg-four);
        color: var(--color-white-one);
    }

    button:hover {
        background-color: var(--color-bg-five);
    }

    .login {
        background-color: #151;
    }
    .login:hover {
        background-color: #141;
    }
    .cancel {
        background-color: #711;
    }
    .cancel:hover {
        background-color: #611;
    }
    .dragover {
        background-color: #55f5;
    }
    @media (max-width: 600px) {
        .layout {
            height: initial;
            display: initial;
        }
        button {
            width: 6rem;
        }
        .session-wrapper {
            padding: 3rem;
            width: 90%;
            margin: auto;
        }
    }
</style>
