<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Drop from "$lib/components/drops/Drop.svelte";
    import {
        previewAndSetDropItems,
        updateRecents,
        shortcutHandler,
        dropOkHandler,
    } from "$lib/scripts/utils";
    import {
        autosave,
        dropMini,
        previewItem,
        refreshClicked,
    } from "$lib/scripts/stores";
    import { onMount } from "svelte";
    import {
        checkRefreshTimeout,
        checkSessionTimeout,
    } from "$lib/scripts/shared/utils";
    import type Dialog from "$lib/components/Dialog.svelte";

    let draggedOver = false;
    export function imgDropHandler(e: DragEvent) {
        e.preventDefault();
        draggedOver = false;
        $dropMini = false;
        previewItem.set(undefined);
        if (e.dataTransfer?.files) {
            previewAndSetDropItems(e.dataTransfer.files);
        }
        if ($autosave) dropOkHandler();
    }
    onMount(() => {
        try {
            updateRecents();
            checkSessionTimeout();
            checkRefreshTimeout();
            $refreshClicked = false;
        } catch (error) {
            console.warn(error);
        }
    });
</script>

<svelte:window
    on:offline={() => {
        window.alert("You're offline");
    }}
    on:keydown={shortcutHandler}
/>

<div class="layout">
    <Header />
    <slot />
    <Drop />
</div>

<style>
    .layout {
        display: flex;
    }

    @media (max-width: 800px) {
    }
    @media (max-width: 600px) {
        .layout {
            height: initial;
            display: initial;
        }
    }
</style>
