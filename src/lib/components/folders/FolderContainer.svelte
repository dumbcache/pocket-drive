<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { FOLDER_MIME_TYPE, fetchMultiple } from "$lib/scripts/gdrive/utils";
    import { folderStore } from "$lib/scripts/shared/stores";
    import { getToken } from "$lib/scripts/shared/utils";
    import { activeParentId } from "$lib/scripts/stores";
    import Folder from "./Folder.svelte";

    export let view: string;
    export let observer: IntersectionObserver;

    let folders: FileResponse | undefined;
    let childObserver: IntersectionObserver;
    let inspectionLog = {};

    let foot: HTMLElement;
    let container: HTMLElement;

    $: foot && observer?.observe(foot);

    let unsubscribe = folderStore.subscribe((data) => {
        if (data) {
            let files = data?.files;
            folders = files;
            setTimeout(() => {
                // childInspection(files);
            }, 1000);
        }
    });

    onDestroy(() => {
        unsubscribe();
        // childObserver?.disconnect();
    });

    // function childInspection(items: FileResponse | undefined) {
    //     childObserver = new IntersectionObserver(
    //         (entries) => {
    //             entries.forEach((entry) => {
    //                 if (entry.isIntersecting) {
    //                     let { id } = entry.target.dataset;
    //                     console.log(id);
    //                     inspectionLog[id] = true;
    //                     childObserver.unobserve(entry.target);
    //                 }
    //             });
    //         },
    //         { threshold: 0 }
    //     );
    //     items?.forEach((item) => {
    //         let id = item.id;
    //         if (id && !inspectionLog[id]) {
    //             let li = container?.querySelector(`[data-id="${id}"]`);
    //             li && childObserver.observe(li);
    //         }
    //     });
    // }
</script>

<section
    class="folder-container"
    style:display={view === "folder" ? "initial" : "none"}
>
    {#if folders && folders.length > 0}
        <ol class="list" bind:this={container}>
            {#each folders as folder}
                {#key folder.id}
                    <li data-id={folder.id}>
                        <Folder {folder} visible={inspectionLog[folder.id]} />
                    </li>
                {/key}
            {/each}
        </ol>
        <div bind:this={foot}></div>
    {/if}
</section>

<style>
    .folder-container {
        padding-top: 10rem;
    }

    .list {
        display: flex;
        flex-flow: row wrap;
        align-items: flex-start;
        justify-content: center;
        gap: var(--content-gap);
    }

    @media (max-width: 600px) {
        .folder-container {
            padding-top: 5rem;
        }
    }
</style>
