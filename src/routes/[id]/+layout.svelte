<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Drop from "$lib/components/drops/Drop.svelte";
    import {
        // setRefreshTimeout,
        signUserOut,
        updateRecents,
        setSessionTimeout,
    } from "$lib/scripts/utils";
    import { onMount } from "svelte";
    import { dropItems, isLoggedin, sessionTimeout } from "$lib/scripts/stores";
    import { googleClient } from "$lib/scripts/login";
    import { goto } from "$app/navigation";
    import { previewAndSetDropItems } from "$lib/scripts/image";

    let draggedOver = false;

    export function imgDropHandler(e: DragEvent) {
        e.preventDefault();
        draggedOver = false;
        let files = e.dataTransfer?.files;
        let items = e.dataTransfer?.items;
        for (let i of items) {
            if (
                i.kind === "other" &&
                i.type === "application/x-moz-nativeimage"
            ) {
                const mozUrl = e.dataTransfer.getData(
                    "application/x-moz-file-promise-url"
                );
                console.log(mozUrl);
            }
        }
        if (files) {
            previewAndSetDropItems(files);
        }
    }
    onMount(() => {
        try {
            updateRecents();
            setSessionTimeout();
            // setRefreshTimeout();
            googleClient.loadGSIScript();
        } catch (error) {
            console.warn(error);
        }
    });

    function signoutHandler() {
        isLoggedin.set(false);
        signUserOut();
        goto("/");
    }
</script>

<svelte:window
    on:offline={() => {
        window.alert("You're offline");
    }}
    on:keydown
/>

<div
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
    <Header />
    <slot />
    {#if $dropItems.length > 0}
        <Drop />
    {/if}
    {#if $sessionTimeout}
        <div class="session-notify" on:wheel|preventDefault>
            <div class="session-wrapper">
                <p>Session expired</p>
                <div class="button-wrapper">
                    <button on:click={signoutHandler}>logout</button>
                    <button on:click={googleClient.requestToken}
                        >continue</button
                    >
                </div>
            </div>
        </div>
    {/if}
</div>

<style>
    .layout {
        display: flex;
    }

    .session-notify {
        position: fixed;
        width: 100%;
        height: 100%;
        top: 0;
        display: grid;
        place-content: center;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
        z-index: 100;
    }
    .session-wrapper {
        display: flex;
        flex-flow: column;
        gap: 1rem;
        border: 1px solid var(--color-outline);
        padding: 5rem;
        border-radius: 1rem;
        box-shadow: 0 0 10px 5px var(--color-focus);
        background-color: var(--primary-bg-color);
    }

    p {
        width: fit-content;
        margin: auto;
    }
    .button-wrapper {
        display: flex;
        gap: 1rem;
    }
    button {
        padding: 0.5rem;
        width: 8rem;
        border: 1px solid var(--color-outline);
        border-radius: 0.5rem;
    }
    button:hover {
        background-color: var(--bg-color-two);
    }
    .dragover {
        background-color: #55f5;
    }
    @media (max-width: 600px) {
        .layout {
            height: initial;
            display: initial;
        }
    }
</style>
