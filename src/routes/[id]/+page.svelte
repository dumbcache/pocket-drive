<script lang="ts">
    import Dirs from "$lib/components/dirs/Dirs.svelte";
    import Imgs from "$lib/components/imgs/Imgs.svelte";
    import DirCreate from "$lib/components/actions/DirCreate.svelte";
    import { onDestroy, onMount } from "svelte";
    import { getInfo } from "$lib/scripts/gdrive/utils";
    import { childWorker } from "$lib/scripts/utils";
    import {
        activeParent,
        fileStore,
        folderStore,
        isLoggedin,
        searchItems,
    } from "$lib/scripts/shared/stores";
    import {
        activeParentId,
        activeParentName,
        editItems,
        activeDirs,
        activeImgs,
        previewItem,
        editConfirm,
        mode,
        editMode,
        activeGrandParentId,
        tempImgs,
        tempDirs,
        favoritesActive,
        reverseActive,
        selectAll,
        editProgress,
    } from "$lib/scripts/stores";
    import Confirm from "$lib/components/actions/Confirm.svelte";
    import EditMode from "$lib/components/actions/EditMode.svelte";
    import { navigating } from "$app/stores";
    import Content from "$lib/components/Content.svelte";
    import folderIcon from "$lib/assets/folder.svg?raw";
    import fileIcon from "$lib/assets/file.svg?raw";
    import { afterNavigate } from "$app/navigation";
    import { previewAndSetDropItems } from "$lib/scripts/shared/image";

    let view: "folder" | "file" = "folder";
    let draggedOver = false;

    // let type: "update" | "delete";
    // let dirToggle = false;
    // let activeId = "";
    // let activeName = "";
    // let contentHidden: string;
    // $: contentHidden =
    //     $editMode === true || $mode === "search" ? "none" : "initial";
    onMount(() => {
        // if ($isLoggedin) {
        //     getInfo($activeParentId).then(({ name, parents }) => {
        //         $activeParentName = name;
        //         $activeGrandParentId = parents![0];
        //     });
        //     $tempImgs = $activeImgs;
        //     $tempDirs = $activeDirs;
        // }
        return navigating.subscribe((val) => val || (view = "folder"));
    });
    onDestroy(() => {
        // $previewItem = undefined;
        // $mode = "";
        // $favoritesActive = false;
        // $reverseActive = false;
    });

    export function imgDropHandler(e: DragEvent) {
        e.preventDefault();
        draggedOver = false;
        let files = e.dataTransfer?.files;
        if (files) {
            previewAndSetDropItems(files);
        }
    }
</script>

<!-- {#if $activeDirs?.length !== 0 || $activeImgs?.length !== 0}
    {#if $editMode}
        <EditMode />
        {#if $activeImgs?.length !== 0}
            <Imgs imgs={$activeImgs} />
        {/if}
    {/if}
    {#if $mode === "search"}
        {#if $searchItems?.length !== 0}
            <Dirs dirs={$searchItems} />
        {/if}
    {/if}
    <div style:display={contentHidden}>
        <div class="count">
            {#if $activeImgs?.length !== 0 && $activeImgs !== undefined}
                <span>Images: {$activeImgs?.length}</span>
            {/if}
            {#if $activeDirs?.length !== 0 && $activeDirs !== undefined}
                <span>Folders: {$activeDirs?.length}</span>
            {/if}
        </div>
        {#if $activeDirs?.length !== 0}
            <Dirs
                dirs={$activeDirs}
                on:editDir={(e) => {
                    activeId = e.detail.id;
                    activeName = e.detail.name;
                    dirToggle = true;
                    type = "update";
                }}
                on:deleteDir={(e) => {
                    activeId = e.detail.id;
                    dirToggle = true;
                    type = "delete";
                }}
            />
        {/if}
        <Imgs imgs={$activeImgs} />
    </div>
{:else}
    <p class="no-files">No Files</p>
{/if}
{#if dirToggle}
    <DirCreate
        {type}
        id={activeId}
        name={type !== "delete" ? activeName : ""}
        on:dirUpdateClose={() => (dirToggle = false)}
        on:dirDeleteClose={() => (dirToggle = false)}
    />
{/if}
{#if $editConfirm}
    <Confirm
        text={"Sure you want to delete?"}
        on:confirmCloseNO={() => {
            // $editMode = "";
            // $selectedCount = 0;
            // $editItems = [];
            $editConfirm = false;
        }}
        on:confirmCloseOK={() => {
            $editProgress = true;
            childWorker.postMessage({
                context: "IMG_DELETE",
                imgs: $editItems,
                token: window.localStorage.getItem("token"),
            });
            $editConfirm = false;
        }}
    />
{/if}
{#if $editProgress}
    <div class="progress">
        <LoadIndicator />
    </div>
{/if} -->
<section
    class="wrapper {draggedOver === true ? 'dragover' : ''}"
    on:dragstart
    on:dragover|preventDefault
    on:dragenter={() => (draggedOver = true)}
    on:dragleave={() => (draggedOver = false)}
    on:drop={imgDropHandler}
>
    <nav class="nav">
        <span>
            <button
                class=""
                on:click={() => (view = "folder")}
                class:active={view === "folder"}
            >
                <span class="btn">
                    {@html folderIcon}
                </span>
            </button>
            <button
                class=""
                on:click={() => (view = "file")}
                class:active={view === "file"}
                ><span class="btn">
                    {@html fileIcon}
                </span>
            </button>
        </span>
        <p class="count">
            <!-- <span>count:</span> -->
            {view === "folder"
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
        background-color: var(--bg-color-three);
        block-size: 100%;
        border: 1px solid var(--color-file-border);
        border-left: 5px solid var(--color-light-blue);
        text-align: right;
        padding: 1rem;
    }
    .no-files {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    .progress {
        display: grid;
        place-content: center;
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        background-color: var(--primary-backdrop-color);
        backdrop-filter: blur(1rem);
        -webkit-backdrop-filter: blur(1rem);
        z-index: 3;
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

    button {
        padding: 0.5rem;
        background-color: var(--bg-color-two);
        width: 5rem;
    }

    .active {
        background-color: var(--bg-color-three);
        border-bottom: 2px solid var(--color-focus);
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
