<script lang="ts">
    import { onDestroy } from "svelte";
    import { navigating, page } from "$app/stores";
    import {
        activeParent,
        activeView,
        fileStore,
        folderStore,
    } from "$lib/scripts/shared/stores";
    import Content from "$lib/components/Content.svelte";
    import { previewAndSetDropItems } from "$lib/scripts/shared/image";
    import beforeNavigate from "$lib/assets/beforeNavigate.svg?raw";
    import Tools from "$lib/components/Tools.svelte";
    import Count from "$lib/components/actions/Count.svelte";

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
    <nav class="nav">
        {#if $page.params?.id !== "r"}
            <button
                class="back-button btn"
                on:click={() => {
                    history.back();
                    $activeView = "FOLDER";
                }}
            >
                {@html beforeNavigate}
            </button>
        {/if}

        <div class="tool-wrapper">
            <Tools />
        </div>

        <h2 class="folder-name one" title={$activeParent.name}>
            {$activeParent.name}
        </h2>
        <Count
            count={view === "FOLDER"
                ? $folderStore?.files.length
                : $fileStore?.files.length}
        />
    </nav>

    <h2 class="folder-name two" title={$activeParent.name}>
        {$activeParent.name}
    </h2>
    <Content
        {view}
        count={view === "FOLDER"
            ? $folderStore?.files.length
            : $fileStore?.files.length}
    />
</section>

<style>
    .wrapper {
        width: 100%;
        padding: 0rem;
    }
    .tool-wrapper {
        display: none;
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
    .back-button {
        position: absolute;
        top: 50%;
        left: 0%;
        transform: translate(0%, -50%);
        margin-left: 2rem;
    }
    .dragover {
        background-color: #55f5;
    }
    .folder-name {
        /* padding: 3rem; */
        font-size: 2rem;
        /* margin: auto; */
        max-width: 40rem;
        width: fit-content;
        word-wrap: unset;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: auto;
    }
    .two {
        display: none;
    }
    @media (max-width: 600px) {
        .wrapper {
            padding: 0rem 0.5rem;
        }
        .tool-wrapper {
            display: initial;
        }
        .nav {
            padding: 1rem 0.5rem 1rem 0.5rem;
            gap: 2rem;
            margin-bottom: 0rem;
        }
        .one {
            display: none;
        }
        .two {
            display: block;
            font-size: initial;
            padding-bottom: 2rem;
            max-width: 80%;
        }
    }
</style>
