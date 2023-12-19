<script lang="ts">
    import { FOLDER_MIME_TYPE, fetchMultiple } from "$lib/scripts/gdrive/utils";
    import { folderStore } from "$lib/scripts/shared/stores";
    import { getToken } from "$lib/scripts/shared/utils";
    import { activeParentId } from "$lib/scripts/stores";
    import { onMount } from "svelte";
    import Folder from "./Folder.svelte";

    let container: HTMLDivElement;
    let wait = false;
    onMount(() => {
        setupIntersectionObserver();
    });

    function setupIntersectionObserver() {
        const observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(async (entry) => {
                    if (entry.isIntersecting) {
                        if ($folderStore?.nextPageToken && wait === false) {
                            wait = true;
                            const files = await fetchMultiple(
                                {
                                    parent: $activeParentId,
                                    mimeType: FOLDER_MIME_TYPE,
                                    pageToken: $folderStore?.nextPageToken,
                                },
                                getToken()
                            );
                            folderStore.update((prev) => {
                                return {
                                    nextPageToken: files.nextPageToken,
                                    files: [...prev?.files, ...files.files],
                                };
                            });
                            wait = false;
                        }
                    }
                });
            },
            { threshold: 0.75 }
        );
        observer.observe(container);
        return () => {
            console.log("remove");
            observer.disconnect();
        };
    }
</script>

<section class="folder-container" bind:this={container}>
    {#if $folderStore}
        <ol>
            {#each $folderStore.files as folder}
                {#key folder.id}
                    <Folder {folder} />
                {/key}
            {/each}
        </ol>
    {/if}
</section>
