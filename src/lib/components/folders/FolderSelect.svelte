<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import doneIcon from "$lib/assets/done.svg?raw";
    import beforeIcon from "$lib/assets/beforeNavigate.svg?raw";
    import historyIcon from "$lib/assets/history.svg?raw";
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
        disableScrolling,
        enableScorlling,
    } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";

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
    let recents = [];
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

    function updateRecents() {
        recents = recents.filter((file) => file?.id !== selectedId);
        recents.unshift({
            id: selectedId,
            name: selectedName,
            parents: [selectedParent],
        });
    }
    function setRecents(e) {
        e.stopPropagation();
        let temp = [...recents];
        if (recents.length > 0) {
            let item = temp.shift();
            selectedId = item.id;
            selectedName = item.name;
            selectedParent = item.parents[0];
            tempFolderStore.files = temp;
            listVisible = true;
        }
    }

    async function okHandler(e: MouseEvent) {
        e.stopPropagation();
        updateRecents();
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
        fetchMultiple(
            {
                parent: $activeParent?.id,
                mimeType: FOLDER_MIME_TYPE,
                pageSize: 500,
            },
            accessToken,
            true,
            true
        );
        $folderAction = undefined;
        $progress = false;
        return;
    }

    onMount(() => {
        let items = window.localStorage.getItem("recents");
        recents = JSON.parse(items);
        recents ?? (recents = []);
        disableScrolling();
    });
    onDestroy(() => {
        enableScorlling();
        window.localStorage.setItem("recents", JSON.stringify(recents));
    });
</script>

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="wrapper"
    onkeydown={(e) => e.stopPropagation()}
    onclick={() => {
        dispatchClose();
        $folderAction = undefined;
    }}
>
    {#if !$progress}
        <!-- svelte-ignore a11y-no-static-element-interactions -->
        <!-- svelte-ignore a11y_click_events_have_key_events -->
        <div class="folder-select" onclick={(e) => e.stopPropagation()}>
            <section class="nav">
                <button
                    class="btn root"
                    title="root"
                    onclick={(e) => {
                        e.stopPropagation();
                        fetchInfo(root);
                    }}>/R</button
                >
                {#if selectedId !== root}
                    <button
                        class="btn s-prime prev"
                        title="previous"
                        onclick={(e) => {
                            e.stopPropagation();
                            fetchInfo(selectedParent);
                        }}>{@html beforeIcon}</button
                    >
                {/if}
            </section>
            <section class="selection-wrapper">
                <div class="label">Select destination folder</div>
                <div class="selection">
                    <button
                        class="selected"
                        data-id={selectedId}
                        onclick={(e) => {
                            e.stopPropagation();
                            listVisible = !listVisible;
                        }}
                    >
                        {selectedName}
                    </button>
                    <button
                        class="done-button btn s-prime"
                        disabled={selectedId === $activeParent.id}
                        onclick={okHandler}
                    >
                        {@html doneIcon}
                    </button>{#if recents?.length > 0}
                        <button
                            class="btn s-second history-button"
                            title="history"
                            onclick={setRecents}>{@html historyIcon}</button
                        >
                    {/if}
                    {#if listVisible}
                        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
                        <ol class="list" onclick={selectFolder}>
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
                </div>
            </section>
        </div>
    {/if}
</div>

<style>
    .wrapper {
        position: fixed;
        top: 0;
        bottom: 0;
        left: 0;
        right: 0;
        display: grid;
        place-content: center;
        background-color: var(--color-backdrop);
        z-index: 3;
        font-size: var(--size-smaller);
    }

    .folder-select {
        padding: 4rem 2rem;
        border-radius: 1rem;
        display: flex;
        align-items: center;
        box-shadow: 0 0 50px -10px var(--color-black);
        background-color: var(--color-bg-one);
        gap: 2rem;
    }
    .nav {
        display: flex;
        flex-flow: column;
        gap: 1rem;
        align-items: center;
        min-width: 2.8rem;
    }
    .selection-wrapper {
        position: relative;
        display: flex;
        flex-flow: column;
        width: 25rem;
        gap: 2rem;
    }
    .selection,
    .selected {
        width: 100%;
        position: relative;
    }
    .root {
        color: var(--color-red-dark);
    }
    .prev :global(svg) {
        fill: var(--color-red-dark);
    }

    .label {
        color: var(--color-one);
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
    .done-button,
    .history-button {
        position: absolute;
        right: 0.5rem;
        top: 50%;
        transform: translate(0%, -50%);
        filter: none;
    }

    .history-button {
        color: var(--color-two);
        right: 3.5rem;
    }
    .history-button :global(svg) {
        fill: var(--color-two);
    }
    .history-button:hover :global(svg) {
        fill: var(--color-focus);
    }

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
    .list-item:hover {
        filter: none;
        background-color: var(--color-bg-four);
    }
    @media (max-width: 600px) {
        .folder-select {
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
