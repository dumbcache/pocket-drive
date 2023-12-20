<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { IMG_MIME_TYPE, fetchMultiple } from "$lib/scripts/gdrive/utils";
    import { fileStore } from "$lib/scripts/shared/stores";
    import { getToken } from "$lib/scripts/shared/utils";
    import { activeParentId } from "$lib/scripts/stores";
    import File from "./File.svelte";
    import FileLoading from "../FileLoading.svelte";

    export let view: string;

    let files: FileResponse | undefined;
    let nextPageToken: string | undefined;
    let container: HTMLElement;
    let wait = false;
    let placeholderStatus: string;

    let unsubscribe = fileStore.subscribe((data) => {
        if (data) {
            files = data?.files;
            nextPageToken = data?.nextPageToken;
            placeholderStatus = nextPageToken ? "" : "completed";
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
                            placeholderStatus = "loading";
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
                            });
                        }
                    }
                });
            },
            { threshold: [0, 1] }
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
        <footer bind:this={container}>
            <FileLoading status={placeholderStatus} />
        </footer>
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
    footer {
        margin-top: 5rem;
        display: flex;
        justify-content: center;
        align-items: center;
    }

    @media (max-width: 600px) {
        .file-container {
            padding-top: 5rem;
        }
    }
</style>
