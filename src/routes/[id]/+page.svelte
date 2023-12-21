<script lang="ts">
    import Dirs from "$lib/components/dirs/Dirs.svelte";
    import Imgs from "$lib/components/imgs/Imgs.svelte";
    import DirCreate from "$lib/components/actions/DirCreate.svelte";
    import { onDestroy, onMount } from "svelte";
    import { getInfo } from "$lib/scripts/gdrive/utils";
    import { childWorker } from "$lib/scripts/utils";
    import { isLoggedin, searchItems } from "$lib/scripts/shared/stores";
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
        view,
    } from "$lib/scripts/stores";
    import Confirm from "$lib/components/actions/Confirm.svelte";
    import EditMode from "$lib/components/actions/EditMode.svelte";
    import { navigating } from "$app/stores";
    import Main from "$lib/components/Main.svelte";

    let type: "update" | "delete";
    let dirToggle = false;
    let activeId = "";
    let activeName = "";
    let contentHidden: string;
    $: contentHidden =
        $editMode === true || $mode === "search" ? "none" : "initial";
    onMount(() => {
        if ($isLoggedin) {
            getInfo($activeParentId).then(({ name, parents }) => {
                $activeParentName = name;
                $activeGrandParentId = parents![0];
            });
            $tempImgs = $activeImgs;
            $tempDirs = $activeDirs;
        }
    });
    onDestroy(() => {
        $previewItem = undefined;
        $mode = "";
        $favoritesActive = false;
        $reverseActive = false;
    });
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

<Main />

<style>
    .count {
        display: flex;
        gap: 2rem;
        width: fit-content;
        margin-left: auto;
        margin-right: 3rem;
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
    @media (max-width: 600px) {
        .count {
            margin-right: 1rem;
            font-size: 1.3rem;
        }
    }
</style>
