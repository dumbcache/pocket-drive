<script lang="ts">
    import doneIcon from "$lib/assets/done.svg?raw";
    import beforeIcon from "$lib/assets/beforeNavigate.svg?raw";
    import progressIcon from "$lib/assets/progress.svg?raw";
    import { getResource } from "$lib/scripts/gdrive/utils";
    import { fetchFiles } from "$lib/scripts/gdrive/utils";
    import {
        activeGrandParentId,
        activeParentId,
        activeParentName,
        editItems,
        mode,
    } from "$lib/scripts/stores";
    import { onDestroy, onMount } from "svelte";
    import { childWorker } from "$lib/scripts/utils";

    let recentsClicked = false;
    let progress = false;
    let selectedName = $activeParentName;
    let selectedId = $activeParentId;
    let selectedIdParent = $activeGrandParentId;
    let childs: GoogleFile[] = [];
    const root = window.localStorage.getItem("root");
    const token = window.localStorage.getItem("token");

    async function beforeFetchDirs(id: string) {
        getResource(id).then(({ id, name, parents }) => {
            selectedIdParent = parents[0];
            selectedId = id;
            selectedName = name;
            fetchDirs();
        });
    }

    async function fetchDirs() {
        let { files } = await fetchFiles(selectedId, "dirs", 1000, false);
        childs = files;
    }

    onMount(() => {
        fetchDirs();
    });
    onDestroy(() => {});
</script>

<div
    class="move"
    on:keydown|stopPropagation
    on:click={() => progress || ($mode = "select")}
>
    <div
        class="wrapper"
        on:click|stopPropagation={() => {
            recentsClicked = false;
        }}
        on:keydown={() => {}}
    >
        <div class="tools">
            <button
                class="btn root"
                title="root"
                on:click|stopPropagation={() => beforeFetchDirs(root)}
                >/R</button
            >
            {#if selectedId !== root}
                <button
                    class="btn prev"
                    title="previous"
                    on:click|stopPropagation={() => {
                        beforeFetchDirs(selectedIdParent);
                    }}>{@html beforeIcon}</button
                >
            {/if}
        </div>
        <div class="selection">
            <div class="label">Select folder to move</div>
            <button
                class="selected"
                data-id={selectedId}
                on:click|stopPropagation={() =>
                    (recentsClicked = !recentsClicked)}
            >
                {selectedName}
                {#if !progress}
                    <button
                        class="done-button btn"
                        disabled={selectedId === $activeParentId}
                        on:click|stopPropagation={() => {
                            recentsClicked = false;
                            progress = true;
                            childWorker.postMessage({
                                context: "MOVE_IMGS",
                                parent: selectedId,
                                imgs: $editItems,
                                token,
                            });
                        }}>{@html doneIcon}</button
                    >
                {/if}
                {#if progress}
                    <button class="progress-button btn"
                        >{@html progressIcon}</button
                    >
                {/if}
                {#if recentsClicked}
                    <div class="recents">
                        {#if childs.length > 0}
                            {#each childs as child}
                                <button
                                    class="recent"
                                    data-id={child.id}
                                    on:click|stopPropagation={() =>
                                        beforeFetchDirs(child.id)}
                                    >{child.name}</button
                                >
                            {/each}
                        {/if}
                    </div>
                {/if}
            </button>
        </div>
    </div>
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
    .tools {
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
    .recents {
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
    @keyframes spin {
        0% {
            transform: translate(0%, -50%) rotate(0deg);
        }
        50% {
            transform: translate(0%, -50%) rotate(180deg);
        }
        100% {
            transform: translate(0%, -50%) rotate(360deg);
        }
    }

    .progress-button {
        -webkit-animation: spin 1.5s linear 0s infinite;
        animation: spin 1s linear 0s infinite;
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
    .recents {
        max-height: 21rem;
        position: absolute;
        top: 4rem;
        left: 0rem;
        display: flex;
        flex-flow: column;
        overflow-x: hidden;
        overflow-y: scroll;
    }
    .recent {
        padding: 0.8rem 1rem;
    }
    .recent:hover {
        filter: none;
        background-color: #666;
    }
</style>
