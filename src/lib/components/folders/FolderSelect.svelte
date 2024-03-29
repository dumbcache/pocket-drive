<script lang="ts">
    import doneIcon from "$lib/assets/done.svg?raw";
    import beforeIcon from "$lib/assets/beforeNavigate.svg?raw";
    import {
        FOLDER_MIME_TYPE,
        fetchMultiple,
        fetchSingle,
        moveSingle,
    } from "$lib/scripts/gdrive/utils";
    import {
        folderAction,
        folderActionDetail,
        progress,
    } from "$lib/scripts/shared/stores";
    import { getRoot } from "$lib/scripts/shared/utils";
    import { getToken } from "$lib/scripts/shared/utils";
    import { activeParent, folderStore } from "$lib/scripts/shared/stores";
    import { createEventDispatcher } from "svelte";

    export let type: "FOLDER" | "FILE";
    let tempFolderStore = { ...$folderStore };
    type === "FOLDER" &&
        (tempFolderStore.files = tempFolderStore.files?.filter(
            (file) => file.id !== $folderActionDetail.id
        ));

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
            { parent: $activeParent?.id, mimeType: FOLDER_MIME_TYPE },
            accessToken,
            true
        );
        $folderAction = undefined;
        $progress = false;
        return;
    }
</script>

<div
    class="move"
    on:keydown|stopPropagation
    on:click={() => {
        dispatchClose();
        $folderAction = undefined;
    }}
>
    {#if !$progress}
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
                    {selectedName}
                    <button
                        class="done-button btn s-prime"
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
        background-color: var(--primary-backdrop-color);
        backdrop-filter: blur(0.5rem);
        -webkit-backdrop-filter: blur(0.5rem);
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
        background-color: var(--primary-bg-color);
        outline: 2px solid var(--color-focus);
        padding: 2rem;
        border-radius: 1rem;
        display: flex;
        align-items: center;
    }
    .label {
        text-align: start;
        color: var(--color-five);
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
        background-color: var(--bg-color-three);
        color: var(--color-three);
        width: 25rem;
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
        fill: initial;
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
        width: 100%;
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
        background-color: var(--bg-color-five);
    }
    @media (max-width: 600px) {
        .selected {
            width: 100%;
        }
    }
</style>
