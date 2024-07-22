<script lang="ts">
    import {
        activeImage,
        activeView,
        fileStore,
        mode,
        starred,
    } from "$lib/scripts/stores";
    import { onMount } from "svelte";
    import Edit from "$lib/components/Edit.svelte";
    import Folder from "$lib/components/folders/Folder.svelte";
    import File from "$lib/components/files/File.svelte";
    import { get } from "svelte/store";
    import { beforeNavigate } from "$app/navigation";
    import { disableScrolling } from "$lib/scripts/utils";

    export let files: FileResponse | undefined;
    export let view: "FILE" | "FOLDER";
    export let component: typeof Folder | typeof File;
    export let footObserver: IntersectionObserver;
    export let showFileNames = false;

    let childObserver: IntersectionObserver;
    let entryLog = new Set<string>();
    let inspectionLog: { [key: string]: boolean } = {};
    let container: HTMLElement;
    let foot: HTMLElement;

    let lastSelected = -1;
    let allSelected = false;
    let set = new Set<string>();
    let count = 0;
    let memory = 0;

    $: foot && footObserver?.observe(foot);

    beforeNavigate(({ from, to }) => {
        try {
            if (from?.url?.href === to?.url?.href) return;
            entryLog.clear();
            inspectionLog = {};
        } catch (error) {
            console.warn(error);
        }
    });

    function editCloseAction(e) {
        const eles: HTMLElement[] = document.querySelectorAll(".select");
        eles.forEach((ele) => {
            ele.classList.remove("select");
            let detail = e.detail.type;
            if (detail === "DELETE" || detail === "MOVE") {
                ele.style.display = "none";
            }
        });
        allSelected = false;
        count = 0;
        memory = 0;
        set.clear();
        lastSelected = -1;
    }

    function selectAllAction() {
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

    function updateSelection(
        index: string,
        id: string,
        size: string,
        target: HTMLLIElement
    ) {
        if (set.has(id)) {
            set.delete(id);
            count--;
            size && (memory -= Number(size));
            target.classList.toggle("select");
            return;
        }
        set.add(id);
        count++;
        size && (memory += Number(size));
        target.classList.toggle("select");
        lastSelected = Number(index);
    }

    export function handleImageClick(e) {
        let eles = e.composedPath();
        let [target] = eles.filter((ele) => ele.localName === "li");
        if (!target) return;
        let { id, index, size } = target?.dataset;
        if (!id) return;
        switch (get(mode)) {
            case "edit":
                if (e.shiftKey) {
                    index = Number(index);
                    if (lastSelected < index) {
                        for (let i = lastSelected + 1; i < index + 1; i++) {
                            const ele = container.querySelector(
                                `[data-index="${i}"]`
                            );
                            let { id, index, size } = ele?.dataset;
                            updateSelection(index, id, size, ele);
                        }
                        return;
                    } else {
                        for (let i = lastSelected - 1; i > index - 1; i--) {
                            const ele = container.querySelector(
                                `[data-index="${i}"]`
                            );
                            let { id, index, size } = ele?.dataset;
                            updateSelection(index, id, size, ele);
                        }
                        return;
                    }
                }
                updateSelection(index, id, size, target);
                return;
            default:
                if (view === "FOLDER") return;
                const [file] = get(fileStore)?.files.filter(
                    (file) => file.id === id
                );
                activeImage.set(file);
                mode.set("view");
                disableScrolling();
                return;
        }
    }

    function childInspection(items: FileResponse | undefined) {
        childObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.timeoutid = setTimeout(() => {
                            let { id } = (entry.target as HTMLElement).dataset;
                            if (id) {
                                inspectionLog[id] = true;
                                childObserver.unobserve(entry.target);
                            }
                        }, 700);
                    } else {
                        clearTimeout(entry.target.timeoutid);
                    }
                });
            },
            { threshold: 0 }
        );
        items?.forEach((item) => {
            let id = item.id;
            if (id && !entryLog.has(id)) {
                let li = container?.querySelector(`[data-id="${id}"]`);
                li && childObserver.observe(li);
                entryLog.add(id);
            }
        });
    }

    $: setTimeout(() => {
        childInspection(files);
    }, 1000);

    onMount(() => {
        childInspection(files);
    });
</script>

{#if $mode === "edit" && $activeView === view}
    <Edit
        {view}
        {set}
        {count}
        on:close={editCloseAction}
        {memory}
        on:selectAll={selectAllAction}
    />
{/if}
{#if files && files.length > 0}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <ol
        class="list"
        bind:this={container}
        class:edit-mode={$mode === "edit"}
        on:click={handleImageClick}
        on:keydown
    >
        {#each files as file, index (file.id)}
            <li
                data-index={index}
                data-id={file.id}
                data-size={file?.size}
                data-starred={file.starred}
                class:select={allSelected}
                style:display={$starred === true && file.starred === false
                    ? "none"
                    : "initial"}
            >
                <svelte:component
                    this={component}
                    {file}
                    visible={inspectionLog[file.id]}
                    {showFileNames}
                ></svelte:component>
            </li>
        {/each}
    </ol>
    <div id="{view === 'FILE' ? 'file' : 'folder'}-foot" bind:this={foot}></div>
{/if}

<style>
    .list {
        display: flex;
        padding-top: var(--vertical-padding);
        flex-flow: row wrap;
        align-items: flex-start;
        justify-content: center;
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
    .edit-mode {
        padding: 0rem 5rem;
    }
    @media (max-width: 600px) {
        .edit-mode {
            padding: unset;
        }
    }
</style>
