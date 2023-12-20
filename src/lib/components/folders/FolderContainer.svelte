<script lang="ts">
    import { FOLDER_MIME_TYPE, fetchMultiple } from "$lib/scripts/gdrive/utils";
    import { folderStore } from "$lib/scripts/shared/stores";
    import { getToken } from "$lib/scripts/shared/utils";
    import { activeParentId } from "$lib/scripts/stores";
    import { onDestroy, onMount } from "svelte";
    import Folder from "./Folder.svelte";

    let folders: FileResponse | undefined;
    let nextPageToken: string | undefined;
    let container: HTMLElement;
    let wait = false;

    let unsubscribe = folderStore.subscribe((data) => {
        folders = data?.files;
        nextPageToken = data?.nextPageToken;
    });

    onMount(() => {
        if ($folderStore?.nextPageToken) {
            setupIntersectionObserver();
        }
    });

    onDestroy(() => {
        unsubscribe();
    });

    function setupIntersectionObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        if (nextPageToken && wait === false) {
                            wait = true;
                            fetchMultiple(
                                {
                                    parent: $activeParentId,
                                    mimeType: FOLDER_MIME_TYPE,
                                    pageToken: nextPageToken,
                                },
                                getToken()
                            ).then((folders) => {
                                folderStore.update((prev) => {
                                    return {
                                        nextPageToken: folders.nextPageToken,
                                        files: [
                                            ...prev?.files,
                                            ...folders.files,
                                        ],
                                    };
                                });
                                wait = false;
                            });
                        }
                    }
                });
            },
            { threshold: 1 }
        );
        observer.observe(container);
        return () => {
            console.log("remove");
            observer.disconnect();
        };
    }
</script>

{#if folders && folders.length > 0}
    <section class="folder-container" bind:this={container}>
        <ol class="list">
            {#each folders as folder}
                {#key folder.id}
                    <Folder {folder} />
                {/key}
            {/each}
        </ol>
    </section>
{/if}

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
