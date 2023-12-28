<script lang="ts">
    import doneIcon from "$lib/assets/done.svg?raw";
    import beforeIcon from "$lib/assets/beforeNavigate.svg?raw";
    import progressIcon from "$lib/assets/progress.svg?raw";
    import {
        FOLDER_MIME_TYPE,
        fetchMultiple,
        fetchSingle,
        getInfo,
        moveSingle,
    } from "$lib/scripts/gdrive/utils";
    import { fetchFiles } from "$lib/scripts/gdrive/utils";
    import { activeGrandParentId } from "$lib/scripts/stores";
    import {
        folderAction,
        folderActionDetail,
        mode,
    } from "$lib/scripts/shared/stores";
    import { onDestroy, onMount } from "svelte";
    import { childWorker, getRoot } from "$lib/scripts/shared/utils";
    import { getToken } from "$lib/scripts/shared/utils";
    import {
        activeParent,
        editItems,
        folderStore,
    } from "$lib/scripts/shared/stores";
    import Spinner from "../Spinner.svelte";

    export let type: "FOLDER" | "FILE";
    let tempFolderStore = { ...$folderStore };
    type === "FOLDER" &&
        (tempFolderStore.files = tempFolderStore.files?.filter(
            (file) => file.id !== $folderActionDetail.id
        ));
    let selectedName = $activeParent?.name;
    let selectedId = $activeParent?.id;
    let selectedParent = $activeParent.parents && $activeParent.parents[0];
    let progress = false;
    let listVisible = false;
    let accessToken = getToken();

    let recentsClicked = false;
    let selectedIdParent = $activeGrandParentId;
    let childs: GoogleFile[] = [];
    const root = getRoot();
    const token = getToken();

    async function beforeFetchDirs(id: string) {
        getInfo(id).then(({ id, name, parents }) => {
            selectedIdParent = parents[0];
            selectedId = id;
            selectedName = name;
            fetchDirs();
        });
    }

    function setData(data: GoogleFileRes) {}

    async function fetchChildren(id: string) {
        tempFolderStore = await fetchMultiple(
            { parent: id, mimeType: FOLDER_MIME_TYPE },
            accessToken
        );
        if (type === "FOLDER") {
            if (selectedId === $activeParent.id) {
                tempFolderStore.files = tempFolderStore.files?.filter(
                    (file) => file.id !== $folderActionDetail.id
                );
            }
        }
    }

    async function fetchInfo(id: string) {
        const data = await fetchSingle(id, "FOLDER", accessToken);
        await fetchChildren(data.id);
        selectedId = data.id;
        selectedName = data.name;
        selectedParent = data?.parents[0];
    }

    async function fetchDirs() {
        let { files } = await fetchFiles(selectedId, "dirs", 1000, false);
        childs = files;
    }

    onMount(() => {
        fetchDirs();
    });
    async function okHandler(e: MouseEvent) {
        e.stopPropagation();
        listVisible = false;
        progress = true;
        if (type === "FOLDER") {
            await moveSingle(selectedId, $folderActionDetail?.id, accessToken);
            folderStore.update((prev) => {
                return {
                    files: prev?.files.filter(
                        (file) => file.id !== $folderActionDetail.id
                    ),
                    nextPageToken: prev?.nextPageToken,
                };
            });
            fetchMultiple(
                { parent: selectedId, mimeType: FOLDER_MIME_TYPE },
                accessToken,
                true
            );
            fetchMultiple(
                { parent: $folderActionDetail?.id, mimeType: FOLDER_MIME_TYPE },
                accessToken,
                true
            );
            $folderAction = undefined;
            return;
        }
        childWorker.postMessage({
            context: "MOVE",
            parent: selectedId,
            imgs: $editItems,
            token,
        });
    }

    async function selectFolder(e: MouseEvent) {
        e.stopPropagation();
        let tempId = e.target.dataset.id;
        await fetchChildren(tempId);
        selectedId = tempId;
        selectedName = e.target.innerText;
        selectedParent = selectedId;
    }
</script>

<div
    class="move"
    on:keydown|stopPropagation
    on:click={() => ($folderAction = undefined)}
>
    {#if progress}
        <div class="spinner">
            <Spinner />
        </div>
    {:else}
        <div
            class="wrapper"
            on:click|stopPropagation={() => (listVisible = false)}
            on:keydown
        >
            <div class="nav">
                <button
                    class="btn root"
                    title="root"
                    on:click|stopPropagation={() => fetchInfo(root)}>/R</button
                >
                {#if selectedId !== root}
                    <button
                        class="btn prev"
                        title="previous"
                        on:click|stopPropagation={() => {
                            fetchInfo(selectedParent);
                        }}>{@html beforeIcon}</button
                    >
                {/if}
            </div>
            <div class="selection">
                <div class="label">Select destination folder</div>
                <button
                    class="selected"
                    data-id={selectedId}
                    on:click|stopPropagation={() =>
                        (listVisible = !listVisible)}
                >
                    {selectedName}
                    <button
                        class="done-button btn"
                        disabled={selectedId === $activeParent.id}
                        on:click={okHandler}>{@html doneIcon}</button
                    >
                    {#if listVisible}
                        <ol
                            class="list"
                            on:keydown
                            on:click|stopPropagation={selectFolder}
                        >
                            {#if tempFolderStore.files}
                                {#if tempFolderStore.files.length > 0}
                                    {#each tempFolderStore.files as file}
                                        <li class="list-item" data-id={file.id}>
                                            {file.name}
                                        </li>
                                    {/each}
                                {/if}
                            {/if}
                        </ol>
                    {/if}
                </button>
            </div>
        </div>
    {/if}
</div>

<style>
    .move {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: grid;
        place-content: center;
        color: var(--color-white);
        background-color: var(--primary-backdrop-color);
        backdrop-filter: blur(5rem);
        -webkit-backdrop-filter: blur(5rem);
        z-index: 3;
        user-select: none;
    }
    .nav {
        display: flex;
        flex-flow: column;
        gap: 1rem;
    }
    .root {
        color: red;
    }
    .prev :global(svg) {
        fill: red;
    }
    .wrapper {
        background-color: var(--primary-backdrop-color);
        padding: 2rem;
        border-radius: 1rem;
        display: flex;
        align-items: center;
    }
    .label {
        text-align: start;
        color: var(--color-white-level-five);
    }
    .selection {
        position: relative;
        padding: 1rem;
        border-radius: 1rem;
        display: flex;
        flex-flow: column;
        max-width: fit-content;
        gap: 1rem;
    }
    button {
        text-align: start;
        cursor: pointer;
    }
    .selected,
    .list {
        filter: none;
        background-color: #555;
        width: 25rem;
        cursor: pointer;
        border-radius: 0.5rem;
    }
    .done-button,
    .progress-button {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translate(0%, -50%);
        filter: none;
    }
    .done-button:disabled {
        cursor: not-allowed;
        filter: invert(0.5);
    }
    .done-button:disabled :global(svg) {
        cursor: not-allowed;
    }

    .done-button:hover :global(svg) {
        fill: #3af;
    }
    .done-button :global(svg) {
        fill: #0ff;
    }
    .selected {
        padding: 1rem;
        position: relative;
    }
    .list {
        max-height: 21rem;
        position: absolute;
        top: 4rem;
        left: 0rem;
        display: flex;
        flex-flow: column;
        overflow-x: hidden;
        overflow-y: scroll;
    }
    .list-item {
        padding: 0.8rem 1rem;
    }
    .list-item:hover {
        filter: none;
        background-color: #666;
    }
</style>
