<script lang="ts">
    import { onDestroy } from "svelte";
    import {
        activeImage,
        fileStore,
        mode,
        preferences,
        starred,
    } from "$lib/scripts/stores";
    import File from "$lib/components/files/File.svelte";
    import Edit from "$lib/components/files/Edit.svelte";
    import { navigating } from "$app/stores";
    import View from "./View.svelte";
    import { get } from "svelte/store";

    export let view: string;
    export let observer: IntersectionObserver;

    let files: FileResponse | undefined;
    let childObserver: IntersectionObserver;
    let inspectionLog = {};

    let foot: HTMLElement;
    let container: HTMLElement;

    let allSelected = false;
    let set = new Set<string>();
    let count = 0;
    let memory = 0;
    let showFileNames = false;

    $: foot && observer?.observe(foot);

    let unsubscribe = fileStore.subscribe((data) => {
        if (data) {
            files = data?.files;
            setTimeout(() => {
                childInspection(files);
            }, 1000);
        }
    });

    let navUnsubscribe = navigating.subscribe((data) => {
        if (!data) {
            inspectionLog = {};
        }
    });

    let preferencesUnsubscribe = preferences.subscribe((val) => {
        showFileNames = val?.showFileNames;
    });
    onDestroy(() => {
        unsubscribe();
        navUnsubscribe();
        preferencesUnsubscribe();
        childObserver?.disconnect();
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
        memory = 0;
        set.clear();
    }

    function selectAllAction() {
        allSelected = !allSelected;
        memory = 0;
        if (allSelected) {
            files?.forEach((file) => {
                set.add(file.id);
                memory += Number(file.size);
            });
            count = set.size;
            return;
        }
        set.clear();
        count = set.size;
    }

    export function handleImageClick(e) {
        let eles = e.composedPath();
        let [target] = eles.filter((ele) => ele.localName === "li");
        if (!target) return;
        let { id, size } = target?.dataset;
        if (!id) return;
        switch (get(mode)) {
            case "edit":
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
                return;

            default:
                const [file] = get(fileStore)?.files.filter(
                    (file) => file.id === id
                );
                activeImage.set(file);
                mode.set("view");
                return;
        }
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
            if (id && !inspectionLog[id]) {
                let li = container?.querySelector(`[data-id="${id}"]`);
                li && childObserver.observe(li);
            }
        });
    }
</script>

<section
    class="file-container"
    style:display={view === "FILE" ? "initial" : "none"}
>
    {#if $mode === "edit" && view === "FILE"}
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
            on:click={handleImageClick}
            on:keydown
        >
            {#each files as file (file.id)}
                <li
                    data-id={file.id}
                    data-size={file.size}
                    data-starred={file.starred}
                    class:select={allSelected}
                    style:display={$starred === true && file.starred === false
                        ? "none"
                        : "initial"}
                >
                    <File
                        {file}
                        visible={inspectionLog[file.id]}
                        {showFileNames}
                    />
                </li>
            {/each}
        </ol>
        <div id="file-foot" bind:this={foot}></div>
    {/if}
</section>

{#if $mode === "view"}
    <View {files} />
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
</style>
