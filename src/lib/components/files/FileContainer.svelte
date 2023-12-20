<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { IMG_MIME_TYPE, fetchMultiple } from "$lib/scripts/gdrive/utils";
    import { fileStore } from "$lib/scripts/shared/stores";
    import { getToken } from "$lib/scripts/shared/utils";
    import { activeParentId } from "$lib/scripts/stores";
    import File from "./File.svelte";

    export let view: string;

    let files: FileResponse | undefined;
    let nextPageToken: string | undefined;
    let container: HTMLElement;
    let wait = false;

    let unsubscribe = fileStore.subscribe((data) => {
        if (data) {
            files = data?.files;
            nextPageToken = data?.nextPageToken;
        }
    });

    onMount(() => {
        if (nextPageToken) {
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
                            ).then((data) => {
                                fileStore.update((prev) => {
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
            { threshold: [0.75, 1] }
        );
        observer.observe(container);
        return () => {
            observer.disconnect();
        };
    }
</script>

<section
    class="file-container"
    style:display={view === "file" ? "initial" : "none"}
>
    {#if files && files.length > 0}
        <ol class="list">
            {#each files as file}
                {#key file.id}
                    <File {file} />
                {/key}
            {/each}
        </ol>
        <div bind:this={container}></div>
    {/if}
</section>

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
