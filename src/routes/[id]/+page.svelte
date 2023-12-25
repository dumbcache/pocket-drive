<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import {
        activeView,
        fileStore,
        folderStore,
    } from "$lib/scripts/shared/stores";
    import { navigating } from "$app/stores";
    import Content from "$lib/components/Content.svelte";
    import { previewAndSetDropItems } from "$lib/scripts/shared/image";

    let view = $activeView;
    let draggedOver = false;

    export function imgDropHandler(e: DragEvent) {
        e.preventDefault();
        draggedOver = false;
        let files = e.dataTransfer?.files;
        if (files) {
            previewAndSetDropItems(files);
        }
    }
    const unsubscribeNavigation = navigating.subscribe(
        (val) => val || (view = "FOLDER")
    );
    const unsubscribeView = activeView.subscribe((data) => (view = data));
    onDestroy(() => {
        unsubscribeView();
        unsubscribeNavigation();
    });
</script>

<section
    class="wrapper {draggedOver === true ? 'dragover' : ''}"
    on:dragstart
    on:dragover|preventDefault
    on:dragenter={() => (draggedOver = true)}
    on:dragleave={() => (draggedOver = false)}
    on:drop={imgDropHandler}
>
    <nav class="nav">
        <p class="count">
            <!-- <span>count:</span> -->
            {view === "FOLDER"
                ? $folderStore?.files.length
                : $fileStore?.files.length}
        </p>
    </nav>

    <Content {view} />
</section>

<style>
    .count {
        gap: 2rem;
        font-size: 1.3rem;
        min-width: 5rem;
        /* background-color: var(--bg-color-three); */
        block-size: 100%;
        border: 1px solid var(--color-file-border);
        border-left: 5px solid var(--color-light-blue);
        text-align: right;
        padding: 0.5rem;
    }

    .wrapper {
        width: 100%;
        padding: 0rem;
    }
    .nav {
        width: 100%;
        margin-bottom: 2rem;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: flex-end;
        padding: 2rem 0rem;
        position: sticky;
        top: 0;
        background-color: var(--primary-bg-color);
        z-index: 1;
        gap: 5rem;
    }

    .dragover {
        background-color: #55f5;
    }
    /* .active :global(svg) {
        fill: var(--color-focus);
    } */

    @media (max-width: 600px) {
        .wrapper {
            padding: 1rem;
        }
        .nav {
            margin-bottom: 2rem;
        }
    }
</style>
