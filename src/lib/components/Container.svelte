<script lang="ts">
    import Edit from "$lib/components/Edit.svelte";
    import Folder from "$lib/components/folders/Folder.svelte";
    import File from "$lib/components/files/File.svelte";
    import { beforeNavigate } from "$app/navigation";
    import { disableScrolling } from "$lib/scripts/utils";
    import imgCreate from "$lib/assets/imgCreate.svg?raw";
    import folderCreate from "$lib/assets/folderCreate.svg?raw";
    import {
        fileStore,
        folderStore,
        states,
        tempStore,
    } from "$lib/scripts/stores.svelte";
    import FileLoading from "$lib/components/utils/FileLoading.svelte";
    import { SvelteSet } from "svelte/reactivity";
    import { observer } from "$lib/scripts/observer";

    let {
        files,
        view,
        showFileNames,
    }: {
        files: FileResponse | undefined;
        view: View;
        showFileNames?: boolean;
    } = $props();

    let entryLog = new Set<string>();
    let inspectionLog = $state<{ [key: string]: boolean }>({});
    let container = $state<HTMLElement>();
    let foot = $state<HTMLElement>();

    let lastSelected = -1;
    let allSelected = $state(false);
    let set = new SvelteSet<string>();
    let count = $state(0);
    let memory = $state(0);

    $effect(() => {
        foot && observer?.observe(foot);
        inspection(files);
    });

    beforeNavigate(({ from, to }) => {
        try {
            if (from?.url?.href === to?.url?.href) return;
            entryLog.clear();
            inspectionLog = {};
        } catch (error) {
            console.warn(error);
        }
    });

    function closeHandler(type: string) {
        const eles: HTMLElement[] = container?.querySelectorAll(".select");
        eles.forEach((ele) => {
            ele.classList.remove("select");
            if (type === "DELETE" || type === "MOVE" || type === "TOP") {
                ele.style.display = "none";
            }
        });
        allSelected = false;
        count = 0;
        memory = 0;
        set.clear();
        lastSelected = -1;
        states.mode = "";
    }

    function selectAllHandler() {
        allSelected = !allSelected;
        memory = 0;
        if (allSelected) {
            files?.forEach((file) => {
                set.add(file.id);
                file?.size && (memory += Number(file.size));
            });
            count = set.size;
            lastSelected = count;
            return;
        }
        set.clear();
        count = set.size;
        lastSelected = -1;
    }

    function updateSelection(index: string, id: string, size: string) {
        if (set.has(id)) {
            set.delete(id);
            count--;
            size && (memory -= Number(size));
            return;
        }
        set.add(id);
        count++;
        size && (memory += Number(size));
        lastSelected = Number(index);
    }

    export function handleImageClick(e) {
        let eles = e.composedPath();
        let [target] = eles.filter((ele) => ele.localName === "li");
        if (!target) return;
        let { id, index, size } = target?.dataset;
        if (!id) return;
        switch (states.mode) {
            case "EDIT":
                if (e.shiftKey) {
                    index = Number(index);
                    if (lastSelected < index) {
                        for (let i = lastSelected + 1; i < index + 1; i++) {
                            const ele = container.querySelector(
                                `[data-index="${i}"]`
                            );
                            let { id, index, size } = ele?.dataset;
                            updateSelection(index, id, size);
                        }
                        return;
                    } else {
                        for (let i = lastSelected - 1; i > index - 1; i--) {
                            const ele = container.querySelector(
                                `[data-index="${i}"]`
                            );
                            let { id, index, size } = ele?.dataset;
                            updateSelection(index, id, size);
                        }
                        return;
                    }
                }
                updateSelection(index, id, size);
                return;
            default:
                if (view === "FOLDER") return;
                const [file] = fileStore.files.filter((file) => file.id === id);
                tempStore.activeFile = file;
                states.mode = "VIEW";
                disableScrolling();
                return;
        }
    }

    function inspection(items: FileResponse | undefined) {
        items?.forEach((item) => {
            let id = item.id;
            if (id && !entryLog.has(id)) {
                let li = container?.querySelector(`[data-id="${id}"]`);
                li && observer.observe(li);
                entryLog.add(id);
            }
        });
    }
</script>

{#if states.mode === "EDIT" && states.view === view}
    <Edit {view} {set} {count} {closeHandler} {memory} {selectAllHandler} />
{/if}
{#if files && files.length > 0}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <ol
        class="list"
        bind:this={container}
        class:edit-mode={states.mode === "EDIT"}
        onclick={handleImageClick}
    >
        {#each files as file, index (file.id)}
            <li
                data-index={index}
                data-id={file.id}
                data-size={file?.size}
                data-starred={file.starred}
                class:select={set.has(file.id)}
                style:display={states.starred === true && file.starred === false
                    ? "none"
                    : "initial"}
            >
                {#if view === "FOLDER"}
                    <Folder {file} />
                {:else}
                    <File {showFileNames} {file} />
                {/if}
            </li>
        {/each}
    </ol>
    <div id="{view === 'FILE' ? 'FILE' : 'FOLDER'}-FOOT" bind:this={foot}></div>
    <!-- {#if view === "FOLDER" ? folderStore.nextPageToken : fileStore.nextPageToken}
    {/if} -->
    <div class="loading">
        <FileLoading
            pageToken={view === "FOLDER"
                ? folderStore.nextPageToken
                : fileStore.nextPageToken}
        />
    </div>
{:else}
    <div class="no-content">
        {#if view === "FILE"}
            <p>No Data</p>
            <p>
                Click <span class="img">{@html imgCreate}</span> or Drag and Drop
                to upload
            </p>
        {:else}
            <p>No Data</p>
            <p>
                Click <span class="img">{@html folderCreate}</span> to create
            </p>
        {/if}
    </div>
{/if}

<style>
    .list {
        display: flex;
        flex-flow: row wrap;
        align-items: flex-start;
        justify-content: center;
        padding-top: var(--vertical-padding);
        gap: var(--content-gap);
    }

    .select :global(.card) {
        box-shadow: 0 0 5px 1px #fff5;
        filter: brightness(0.3);
    }

    .select {
        border-bottom: 5px solid var(--color-focus);
        border-radius: 1rem;
    }
    .select:hover :global(.card) {
        filter: none;
        filter: brightness(0.3);
    }
    /* .edit-mode {
        padding: 0rem 5rem;
    } */
    .no-content {
        display: flex;
        flex-flow: column nowrap;
        gap: 0.5rem;
        position: fixed;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: var(--color-five);
        text-align: center;
        user-select: none;
        font-size: var(--size-smaller);
    }
    .img {
        vertical-align: bottom;
        display: inline-flex;
        align-items: center;
        width: var(--secondary-icon-size);
        height: var(--secondary-icon-size);
    }
    .img :global(svg) {
        fill: var(--color-five);
    }
    .loading {
        width: fit-content;
        margin: auto;
        padding: 5rem 0rem;
    }

    @media (max-width: 600px) {
        .edit-mode {
            padding: unset;
        }
        .no-content {
            font-size: smaller;
        }
        .img {
            min-width: 2rem;
            min-height: 2rem;
        }
        .loading {
            padding: 2rem 0rem;
        }
    }
</style>
