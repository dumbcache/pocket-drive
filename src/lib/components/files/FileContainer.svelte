<script lang="ts">
    import { fileStore } from "$lib/scripts/shared/stores";
    import { onMount } from "svelte";
    import File from "./File.svelte";
    import { IMG_MIME_TYPE, fetchMultiple } from "$lib/scripts/gdrive/utils";
    import { activeParentId } from "$lib/scripts/stores";
    import { getToken } from "$lib/scripts/shared/utils";

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
                        if ($fileStore?.nextPageToken && wait === false) {
                            wait = true;
                            const files = await fetchMultiple(
                                {
                                    parent: $activeParentId,
                                    mimeType: IMG_MIME_TYPE,
                                    pageToken: $fileStore?.nextPageToken,
                                },
                                getToken()
                            );
                            fileStore.update((prev) => {
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
            { threshold: 1 }
        );
        observer.observe(container);
        return () => {
            observer.disconnect();
        };
    }
</script>

<section class="image-container" bind:this={container}>
    {#if $fileStore}
        <ol>
            {#each $fileStore.files as file}
                {#key file.id}
                    <File {file} />
                {/key}
            {/each}
        </ol>
    {/if}
</section>

<style>
</style>
