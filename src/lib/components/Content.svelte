<script lang="ts">
    import { onMount } from "svelte";
    import FileContainer from "$lib/components/files/FileContainer.svelte";
    import FolderContainer from "$lib/components/folders/FolderContainer.svelte";
    import {
        FOLDER_MIME_TYPE,
        fetchMultiple,
        IMG_MIME_TYPE,
    } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";
    import {
        states,
        folderStore,
        fileStore,
        tempStore,
    } from "$lib/scripts/stores.svelte";
    import FileLoading from "$lib/components/utils/FileLoading.svelte";
    import Count from "$lib/components/utils/Count.svelte";

    let observer = $state<IntersectionObserver>();
    let status = $derived(
        states.view === "FOLDER"
            ? folderStore?.nextPageToken
                ? ""
                : "completed"
            : fileStore?.nextPageToken
              ? ""
              : "completed"
    );

    onMount(() => {
        setupIntersectionObserver();
    });

    function setupIntersectionObserver() {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach(async (entry) => {
                    if (entry.isIntersecting && status === "") {
                        let ele = entry.target.id;
                        let pageToken =
                            ele === "FOLDER-FOOT"
                                ? folderStore.nextPageToken
                                : fileStore.nextPageToken;
                        let mimeType =
                            ele === "FOLDER-FOOT"
                                ? FOLDER_MIME_TYPE
                                : IMG_MIME_TYPE;
                        let res = await fetchMultiple(
                            {
                                parent: tempStore.activeFolder!.id,
                                mimeType: mimeType,
                                pageToken: pageToken,
                            },
                            getToken()
                        );
                        pageToken = res?.nextPageToken;
                        if (ele === "FOLDER-FOOT") {
                            folderStore.nextPageToken = pageToken;
                            folderStore.files.push(
                                ...(res.files as DriveFolder[])
                            );
                        } else {
                            fileStore.nextPageToken = pageToken;
                            fileStore.files.push(...(res.files as DriveFile[]));
                        }
                    }
                });
            },
            { threshold: 0 }
        );
        return () => observer?.disconnect();
    }
</script>

<div class="content" role="main" ondragstart={(e) => e.preventDefault()}>
    <section
        class="folder-container"
        style:display={states.view === "FOLDER" ? "initial" : "none"}
    >
        <FolderContainer {observer} />
    </section>
    <section
        class="file-container"
        style:display={states.view === "FILE" ? "initial" : "none"}
    >
        <FileContainer {observer} />
    </section>
</div>

{#if fileStore.files.length > 0 || folderStore.files.length > 0}
    <footer>
        <FileLoading {status} />
    </footer>
{/if}

<style>
    .content {
        padding: var(--content-padding);
        padding-top: 0rem;
    }
    footer {
        display: flex;
        justify-content: center;
        align-items: center;
        padding-bottom: 2rem;
    }

    @media (max-width: 600px) {
        footer {
            padding: 2rem 0rem;
        }
    }
</style>
