<script lang="ts">
    import { onDestroy } from "svelte";
    import {
        folderStore,
        folderAction,
        starred,
        mode,
    } from "$lib/scripts/stores";
    import Folder from "$lib/components/folders/Folder.svelte";
    import { navigating } from "$app/stores";
    import ActionForm from "$lib/components/folders/ActionForm.svelte";
    import FolderSelect from "$lib/components/folders/FolderSelect.svelte";
    import Edit from "$lib/components/Edit.svelte";
    import { get } from "svelte/store";

    export let view: string;
    export let observer: IntersectionObserver;

    let files: FileResponse | undefined;
    let childObserver: IntersectionObserver;
    let inspectionLog = {};

    let foot: HTMLElement;
    let container: HTMLElement;

    let lastSelected = -1;
    let allSelected = false;
    let set = new Set<string>();
    let count = 0;

    $: foot && observer?.observe(foot);

    let unsubscribe = folderStore.subscribe((data) => {
        if (data) {
            files = data?.files;
            setTimeout(() => {
                childInspection(files);
            }, 1000);
        }
    });

    let navUnsubscribe = navigating.subscribe((val) => {
        if (!val) {
            inspectionLog = {};
        }
    });

    function editCloseAction(e) {
        const eles = document.querySelectorAll(".select");
        eles.forEach((ele) => {
            ele.classList.remove("select");
            let detail = e.detail.type;
            if (detail === "DELETE" || detail === "MOVE") {
                ele.style.display = "none";
            }
        });
        allSelected = false;
        count = 0;
        set.clear();
        lastSelected = -1;
    }

    function selectAllAction() {
        allSelected = !allSelected;
        if (allSelected) {
            files?.forEach((file) => {
                set.add(file.id);
            });
            count = set.size;
            lastSelected = count;
            return;
        }
        set.clear();
        count = set.size;
        lastSelected = -1;
    }

    function updateSelection(index: string, id: string, target: HTMLLIElement) {
        if (set.has(id)) {
            set.delete(id);
            count--;
            target.classList.toggle("select");
            return;
        }
        set.add(id);
        count++;
        target.classList.toggle("select");
        lastSelected = Number(index);
    }

    export function handleImageClick(e) {
        if (get(mode) !== "edit") return;
        let eles = e.composedPath();
        let [target] = eles.filter((ele) => ele.localName === "li");
        if (!target) return;
        let { id, index } = target?.dataset;
        if (!id) return;
        if (e.shiftKey) {
            index = Number(index);
            if (lastSelected < index) {
                for (let i = lastSelected + 1; i < index + 1; i++) {
                    const ele = container.querySelector(`[data-index="${i}"]`);
                    let { id, index } = ele?.dataset;
                    updateSelection(index, id, ele);
                }
                return;
            } else {
                for (let i = lastSelected - 1; i > index - 1; i--) {
                    const ele = container.querySelector(`[data-index="${i}"]`);
                    let { id, index } = ele?.dataset;
                    updateSelection(index, id, ele);
                }
                return;
            }
        }
        updateSelection(index, id, target);

        return;
    }

    function childInspection(items: FileResponse | undefined) {
        childObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.timeoutid = setTimeout(() => {
                            let { id } = entry.target.dataset;
                            inspectionLog[id] = true;
                            childObserver.unobserve(entry.target);
                        }, 1000);
                    } else {
                        clearTimeout(entry.target.timeoutid);
                    }
                });
            },
            { threshold: 0 }
        );
        items?.forEach((item) => {
            let id = item.id;
            if (id && !inspectionLog[id]) {
                let li = container?.querySelector(`[data-id="${id}"]`);
                li && childObserver.observe(li);
            }
        });
    }

    function actionHandler(e) {
        folderActionDetail = e.detail;
        folderAction = e.type.toUpperCase();
    }

    function actionClose() {
        folderActionDetail = undefined;
        folderAction = undefined;
    }

    onDestroy(() => {
        unsubscribe();
        navUnsubscribe();
        childObserver?.disconnect();
    });
</script>

<section
    class="folder-container"
    style:display={view === "FOLDER" ? "initial" : "none"}
>
    {#if $mode === "edit" && view === "FOLDER"}
        <Edit
            {view}
            {set}
            {count}
            on:close={editCloseAction}
            on:selectAll={selectAllAction}
        />
    {/if}
    {#if files && files.length > 0}
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
        <ol
            class="list"
            bind:this={container}
            on:click={handleImageClick}
            on:keydown
        >
            {#each files as file, index (file.id)}
                <li
                    data-index={index}
                    data-id={file.id}
                    data-starred={file.starred}
                    class:select={allSelected}
                    style:display={$starred === true && file.starred === false
                        ? "none"
                        : "initial"}
                >
                    <Folder {file} visible={inspectionLog[file.id]} />
                </li>
            {/each}
        </ol>
        <div id="folder-foot" bind:this={foot}></div>
    {/if}
</section>

{#if $folderAction}
    {#if $folderAction === "MOVE"}
        <FolderSelect type="FOLDER" />
    {:else}
        <ActionForm />
    {/if}
{/if}

<style>
    .list {
        padding-top: var(--vertical-padding);
        display: flex;
        flex-flow: row wrap;
        align-items: flex-start;
        justify-content: center;
        gap: var(--content-gap);
    }

    .select :global(.card) {
        box-shadow: 0 0 5px 1px #fff5;
        filter: brightness(0.3);
    }
    /* .selected :global(.card) {
        box-shadow: 0 0 5px 1px #fff5;
        filter: brightness(0.3);
    } */

    .select {
        border-bottom: 5px solid var(--color-focus);
        border-radius: 1rem;
    }
    .select:hover :global(.card) {
        filter: none;
        filter: brightness(0.3);
    }
    @media (max-width: 600px) {
    }

    @media (orientation: landscape) {
        .list {
            justify-content: center;
        }
    }
</style>
