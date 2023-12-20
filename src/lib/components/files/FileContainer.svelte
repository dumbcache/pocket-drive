<script lang="ts">
    import { fileStore } from "$lib/scripts/shared/stores";
    import { onDestroy, onMount } from "svelte";
    import File from "./File.svelte";
    import { IMG_MIME_TYPE, fetchMultiple } from "$lib/scripts/gdrive/utils";
    import { activeParentId } from "$lib/scripts/stores";
    import { getToken } from "$lib/scripts/shared/utils";

    let files: FileResponse | undefined;
    let nextPageToken: string | undefined;
    let container: HTMLElement;
    let wait = false;

    let unsubscribe = fileStore.subscribe((data) => {
        files = data?.files;
        nextPageToken = data?.nextPageToken;
    });

    onMount(() => {
        if ($fileStore?.nextPageToken) {
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
                                    mimeType: IMG_MIME_TYPE,
                                    pageToken: nextPageToken,
                                },
                                getToken()
                            ).then((files) => {
                                fileStore.update((prev) => {
                                    return {
                                        nextPageToken: files.nextPageToken,
                                        files: [...prev?.files, ...files.files],
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
            observer.disconnect();
        };
    }
</script>

{#if files && files.length > 0}
    <section class="file-container" bind:this={container}>
        <ol class="list">
            {#each files as file}
                {#key file.id}
                    <File {file} />
                {/key}
            {/each}
        </ol>
    </section>
{/if}

<style>
    .file-container {
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
        .file-container {
            padding-top: 5rem;
        }
    }
</style>
