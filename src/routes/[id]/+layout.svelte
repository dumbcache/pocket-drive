<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Drop from "$lib/components/drops/Drop.svelte";
    import { setSessionTimeout } from "$lib/scripts/utils";
    import { onMount } from "svelte";
    import { previewAndSetDropItems } from "$lib/scripts/image";
    import ProgressBar from "$lib/components/utils/ProgressBar.svelte";
    import Profile from "$lib/components/profile/Profile.svelte";
    import Shortcuts from "$lib/components/Shortcuts.svelte";
    import {
        preferences,
        progressStore,
        states,
        tempStore,
        // pocketStore,
    } from "$lib/scripts/stores.svelte";
    import SessionNotify from "$lib/components/profile/SessionNotify.svelte";

    let { children } = $props();

    let draggedOver = $state(false);

    export function imgDropHandler(e: DragEvent) {
        e.preventDefault();
        draggedOver = false;
        let files = e.dataTransfer?.files;
        if (files) {
            previewAndSetDropItems(files);
        }
    }

    function handlePaste(e: ClipboardEvent) {
        const clipboardItems = e.clipboardData?.items;
        if (!clipboardItems) return;
        for (const item of clipboardItems) {
            if (item.type.match("image/")) {
                const file = item.getAsFile();
                if (file) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    previewAndSetDropItems(dataTransfer.files);
                }
            }
        }
    }

    function handleUnload(e) {
        if (tempStore.dropItems.length > 0) {
            e.preventDefault();
        }
        // window.sessionStorage.setItem(
        //     "pocketStore",
        //     JSON.stringify(Array.from(pocketStore))
        // );
        return true;
    }

    function handleSession(e) {
        try {
            if (e.key === "token") {
                if (e.newValue) {
                    states.sessionTimeout = false;
                } else {
                    states.sessionTimeout = true;
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
            setSessionTimeout();
        } catch (error) {
            console.warn(error);
        }
    });
</script>

<svelte:window
    on:keydown
    on:beforeunload={handleUnload}
    on:storage={handleSession}
    on:paste={handlePaste}
/>

<div
    role="group"
    class="layout {draggedOver === true ? 'dragover' : ''}"
    ondragstart={(e) => e.preventDefault()}
    ondragover={(e) => {
        e.preventDefault();
        draggedOver = true;
    }}
    ondragenter={(e) => {
        draggedOver = true;
    }}
    ondragleave={(e) => {
        draggedOver = false;
    }}
    ondrop={imgDropHandler}
>
    {#if states.mode !== "EDIT"}
        <Header />
    {/if}

    {#if states.profile}
        <Profile />
    {/if}

    {#if states.shortcuts}
        <Shortcuts />
    {/if}

    {#if states.sessionTimeout}
        <SessionNotify />
    {/if}

    {#if progressStore.total}
        <ProgressBar />
    {/if}

    {@render children()}

    {#if tempStore.dropItems.length > 0}
        <Drop />
    {/if}
</div>

<style>
    .layout {
        display: flex;
        background: inherit;
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
