<script lang="ts">
    import { onDestroy } from "svelte";
    import { navigating, page } from "$app/stores";
    import {
        activeView,
        fileStore,
        folderStore,
    } from "$lib/scripts/shared/stores";
    import Content from "$lib/components/Content.svelte";
    import { previewAndSetDropItems } from "$lib/scripts/shared/image";
    import beforeNavigate from "$lib/assets/beforeNavigate.svg?raw";
    import Tools from "$lib/components/Tools.svelte";
    import menuButton from "$lib/assets/menu.svg?raw";
    import Count from "$lib/components/actions/Count.svelte";

    let view = $activeView;
    let draggedOver = false;
    let menu = false;

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
        <!-- <button class="btn menu" on:click={() => (menu = !menu)}>
            {@html menuButton}
        </button> -->
        <!-- {#if menu} -->
        <!-- {/if} -->
        <div class="tool-wrapper">
            <Tools />
        </div>

        <Count
            count={view === "FOLDER"
                ? $folderStore?.files.length
                : $fileStore?.files.length}
        />
    </nav>

    <Content {view} />
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
    /* .active :global(svg) {
        fill: var(--color-focus);
    } */
    .menu {
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
            padding: 1rem;
            gap: 2rem;
        }
        .back-button {
            /* margin-left: 0rem;
            position: relative;
            top: 50%;
            left: 0%;
            transform: unset; */
        }
        .menu {
            display: initial;
        }
    }
</style>
