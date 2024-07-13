<script lang="ts">
    import { createEventDispatcher, onMount } from "svelte";
    import doneIcon from "$lib/assets/done.svg?raw";
    import beforeIcon from "$lib/assets/beforeNavigate.svg?raw";
    import {
        folderAction,
        folderActionDetail,
        progress,
        activeParent,
        folderStore,
    } from "$lib/scripts/stores";
    import {
        FOLDER_MIME_TYPE,
        fetchMultiple,
        fetchSingle,
        moveSingle,
        getRoot,
        getToken,
    } from "$lib/scripts/utils";

    export let type: "FOLDER" | "FILE";
    // let tempFolderStore = { ...$folderStore };
    // type === "FOLDER" &&
    //     (tempFolderStore.files = tempFolderStore.files?.filter(
    //         (file) => file.id !== $folderActionDetail.id
    //     ));

    let tempFolderStore: GoogleFileResponse;
    onMount(() => {
        fetchChildren(selectedId);
    });

    let selectedName = $activeParent?.name;
    let selectedId = $activeParent?.id;
    let selectedParent = $activeParent.parents && $activeParent.parents[0];
    let listVisible = false;
    let accessToken = getToken();
    const root = getRoot();

    const dispatch = createEventDispatcher();
    function dispatchOk() {
        dispatch("ok", { id: selectedId });
    }
    function dispatchClose() {
        dispatch("close");
    }

    async function fetchChildren(id: string) {
        tempFolderStore = await fetchMultiple(
            { parent: id, mimeType: FOLDER_MIME_TYPE, pageSize: 500 },
            accessToken
        );
        while (tempFolderStore.nextPageToken) {
            let f = await fetchMultiple(
                {
                    parent: id,
                    mimeType: FOLDER_MIME_TYPE,
                    pageSize: 500,
                    pageToken: tempFolderStore.nextPageToken,
                },
                accessToken
            );
            tempFolderStore = {
                files: [...tempFolderStore.files, ...f.files],
                nextPageToken: f.nextPageToken,
            };
        }
        if (type === "FOLDER") {
            if (selectedId === $activeParent.id) {
                tempFolderStore.files = tempFolderStore.files?.filter(
                    (file) => file.id !== $folderActionDetail?.id
                );
            }
        }
    }

    async function fetchInfo(id: string) {
        const data = await fetchSingle(id, "FOLDER", accessToken);
        selectedParent = data?.parents[0];
        selectedId = data.id;
        selectedName = data.name;
        listVisible = false;
        await fetchChildren(data.id);
        listVisible = true;
    }

    async function selectFolder(e: MouseEvent) {
        e.stopPropagation();
        let tempId = e.target.dataset.id;
        let tempName = e.target.innerText;
        selectedParent = selectedId;
        selectedId = tempId;
        selectedName = tempName;
        listVisible = false;
        await fetchChildren(tempId);
        listVisible = true;
    }

    async function okHandler(e: MouseEvent) {
        e.stopPropagation();
        listVisible = false;
        if (type === "FILE") {
            dispatchOk();
            return;
        }
        $progress = true;
        await moveSingle(selectedId, $folderActionDetail?.id, accessToken);
        folderStore.update((prev) => {
            return {
                files: prev?.files.filter(
                    (file) => file.id !== $folderActionDetail?.id
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
            { parent: $activeParent?.id, mimeType: FOLDER_MIME_TYPE },
            accessToken,
            true
        );
        $folderAction = undefined;
        $progress = false;
        return;
    }
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="move"
    on:keydown|stopPropagation
    on:wheel|preventDefault
    on:click={() => {
        dispatchClose();
        $folderAction = undefined;
    }}
>
    {#if !$progress}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <div
            class="wrapper"
            on:click|stopPropagation={() => (listVisible = false)}
            on:keydown
            on:wheel|preventDefault
        >
            <div class="nav">
                <button
                    class="btn root"
                    title="root"
                    on:click|stopPropagation={() => fetchInfo(root)}>/R</button
                >
                {#if selectedId !== root}
                    <button
                        class="btn s-prime prev"
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
                    <div class="selected-text">
                        {selectedName}
                    </div>
                    <button
                        class="done-button btn s-prime"
                        disabled={selectedId === $activeParent.id}
                        on:click={okHandler}>{@html doneIcon}</button
                    >
                    {#if listVisible}
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <ol
                            class="list"
                            on:keydown
                            on:click|stopPropagation={selectFolder}
                            on:wheel|stopPropagation
                        >
                            {#if tempFolderStore?.files}
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
        background-color: var(--color-backdrop);
        backdrop-filter: blur(0.1rem);
        -webkit-backdrop-filter: blur(0.1rem);
        z-index: 3;
        user-select: none;
        font-size: var(--size-smaller);
    }
    .nav {
        display: flex;
        flex-flow: column;
        gap: 1rem;
        align-items: center;
        min-width: 2.8rem;
    }
    .root {
        color: var(--color-red-dark);
    }
    .prev :global(svg) {
        fill: var(--color-red-dark);
    }
    .wrapper {
        /* outline: 2px solid var(--color-focus); */
        padding: 4rem 2rem;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        box-shadow: 0 0 50px -10px #0005;
        background-color: var(--color-bg-one);
        gap: 2rem;
    }
    .label {
        text-align: start;
        color: var(--color-one);
    }
    .selection {
        position: relative;
        border-radius: 1rem;
        display: flex;
        flex-flow: column;
        width: 25rem;
        gap: 2rem;
    }
    button {
        text-align: start;
        cursor: pointer;
    }
    .selected,
    .list {
        filter: none;
        cursor: pointer;
        border-radius: 0.5rem;
    }
    .done-button {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translate(0%, -50%);
        filter: none;
    }
    .done-button:disabled :global(svg) {
        /* fill: #ddd; */
    }
    /* .done-button:hover :global(svg) {
        fill: #var;
    } */
    .done-button :global(svg) {
        fill: var(--color-green);
    }
    .selected {
        padding: 1rem;
        position: relative;
        background-color: var(--color-bg-three);
    }
    .list {
        background-color: var(--color-bg-two);
        max-height: 21rem;
        width: 100%;
        position: absolute;
        top: 4rem;
        left: 0rem;
        overflow-x: hidden;
        overflow-y: scroll;
    }
    .list-item {
        padding: 0.8rem 1rem;
        word-wrap: unset;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .list-item:not(:last-child) {
        /* border-bottom: 1px solid var(--color-border); */
        /* border-bottom: 1px solid var(--color); */
    }
    .selected-text {
        word-wrap: unset;
        white-space: nowrap;
        overflow-x: hidden;
        text-overflow: ellipsis;
        padding-right: 3rem;
    }
    .list-item:hover {
        filter: none;
        background-color: var(--color-bg-four);
    }
    @media (max-width: 600px) {
        .wrapper {
            gap: 1rem;
        }
        .selected {
            width: 100%;
        }
        .selection {
            max-width: 20rem;
            gap: 1rem;
        }
    }
</style>
