<script lang="ts">
    import { afterUpdate, onDestroy, onMount } from "svelte";
    import { FOLDER_MIME_TYPE, fetchMultiple } from "$lib/scripts/gdrive/utils";
    import { folderStore } from "$lib/scripts/shared/stores";
    import { getToken } from "$lib/scripts/shared/utils";
    import { activeParentId } from "$lib/scripts/stores";
    import Folder from "./Folder.svelte";

    export let view: string;

    let folders: FileResponse | undefined;
    let nextPageToken: string | undefined;
    let container: HTMLElement;
    let wait = false;
    let observer: IntersectionObserver;

    let unsubscribe = folderStore.subscribe((data) => {
        if (data) {
            console.log(data);
            folders = data?.files;
            nextPageToken = data?.nextPageToken;
        }
    });

    onMount(() => {
        console.log(nextPageToken);
        setTimeout(() => {
            if (nextPageToken) {
                setupIntersectionObserver();
            }
        }, 2000);
    });

    onDestroy(() => {
        unsubscribe();
    });

    function setupIntersectionObserver() {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        console.log(
                            "intersecting",
                            entry.intersectionRatio,
                            wait
                        );
                        if (nextPageToken && wait === false) {
                            wait = true;
                            fetchMultiple(
                                {
                                    parent: $activeParentId,
                                    mimeType: FOLDER_MIME_TYPE,
                                    pageToken: nextPageToken,
                                },
                                getToken()
                            ).then((data) => {
                                folderStore.update((prev) => {
                                    return {
                                        nextPageToken: data.nextPageToken,
                                        files: [...prev?.files, ...data.files],
                                    };
                                });
                                wait = false;
                                container.style.display = "none";
                                container.offsetHeight;
                                container.style.display = "block";
                            });
                        }
                    }
                });
            },
            { threshold: 0 }
        );
        observer.observe(container);
        return () => {
            observer.disconnect();
        };
    }
</script>

<section
    class="folder-container"
    style:display={view === "folder" ? "initial" : "none"}
>
    {#if folders && folders.length > 0}
        <ol class="list">
            {#each folders as folder}
                {#key folder.id}
                    <Folder {folder} />
                {/key}
            {/each}
        </ol>
        <div bind:this={container}></div>
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
