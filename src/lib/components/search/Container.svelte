<script lang="ts">
    import Folder from "$lib/components/folders/Folder.svelte";
    import File from "$lib/components/files/File.svelte";
    import { beforeNavigate } from "$app/navigation";
    import {
        fileSearchStore,
        folderSearchStore,
        states,
    } from "$lib/scripts/stores.svelte";
    import { SvelteSet } from "svelte/reactivity";
    import FileLoading from "$lib/components/utils/FileLoading.svelte";

    let {
        files,
        view,
        footObserver,
        showFileNames,
    }: {
        files: FileResponse | undefined;
        view: View;
        footObserver: IntersectionObserver | undefined;
        showFileNames?: boolean;
    } = $props();

    let childObserver: IntersectionObserver;
    let entryLog = new SvelteSet<string>();
    let inspectionLog = $state<{ [key: string]: boolean }>({});
    let container = $state<HTMLElement>();
    let foot = $state<HTMLElement>();

    $effect(() => {
        foot && footObserver?.observe(foot);
        childInspection(files);
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

    function childInspection(items: FileResponse | undefined) {
        childObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.timeoutid = setTimeout(() => {
                            let { id } = (entry.target as HTMLElement).dataset;
                            if (id) {
                                // inspectionLog[id] = true;
                                entryLog.add(id);
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
            }
        });
    }
</script>

{#if files && files.length > 0}
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <ol class="list" bind:this={container}>
        {#each files as file, index (file.id)}
            <li
                data-index={index}
                data-id={file.id}
                data-starred={file.starred}
                style:display={states.starred === true && file.starred === false
                    ? "none"
                    : "initial"}
            >
                {#if view === "FOLDER"}
                    <Folder {file} visible={entryLog.has(file.id)} />
                {:else}
                    <File
                        {showFileNames}
                        {file}
                        visible={entryLog.has(file.id)}
                    />
                {/if}
            </li>
        {/each}
    </ol>
    <div id="{view === 'FILE' ? 'FILE' : 'FOLDER'}-FOOT" bind:this={foot}></div>

    <div class="loading">
        <FileLoading
            pageToken={view === "FOLDER"
                ? folderSearchStore.nextPageToken
                : fileSearchStore.nextPageToken}
        />
    </div>
{:else}
    <div class="no-content">
        <p>No Data</p>
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

    .loading {
        width: fit-content;
        margin: auto;
        padding-top: 2rem;
    }

    @media (max-width: 600px) {
        .edit-mode {
            padding: unset;
        }
        .no-content {
            font-size: smaller;
        }
    }
</style>
