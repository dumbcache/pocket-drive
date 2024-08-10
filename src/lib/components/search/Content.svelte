<script lang="ts">
    import { onMount } from "svelte";
    import {
        FOLDER_MIME_TYPE,
        IMG_MIME_TYPE,
        searchHandler,
    } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";
    import {
        states,
        folderSearchStore,
        fileSearchStore,
    } from "$lib/scripts/stores.svelte";
    import Container from "$lib/components/search/Container.svelte";

    let { search } = $props();

    let observer = $state<IntersectionObserver>();
    let status = $derived(
        states.view === "FOLDER"
            ? folderSearchStore?.nextPageToken
                ? ""
                : "completed"
            : fileSearchStore?.nextPageToken
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
                                ? folderSearchStore.nextPageToken
                                : fileSearchStore.nextPageToken;
                        let mimeType =
                            ele === "FOLDER-FOOT"
                                ? FOLDER_MIME_TYPE
                                : IMG_MIME_TYPE;

                        let res = await searchHandler(
                            { mimeType, search, pageToken },
                            getToken()
                        );
                        pageToken = res?.nextPageToken;
                        if (ele === "FOLDER-FOOT") {
                            folderSearchStore.nextPageToken = pageToken;
                            folderSearchStore.files.push(
                                ...(res.files as DriveFolder[])
                            );
                        } else {
                            fileSearchStore.nextPageToken = pageToken;
                            fileSearchStore.files.push(
                                ...(res.files as DriveFile[])
                            );
                        }
                    }
                });
            },
            { threshold: 0 }
        );
        return () => observer?.disconnect();
    }
</script>

<div class="search-content" role="main" ondragstart={(e) => e.preventDefault()}>
    <section
        class="folder-container"
        style:display={states.view === "FOLDER" ? "initial" : "none"}
    >
        <!-- <FolderContainer {observer} /> -->
        <Container
            footObserver={observer}
            files={folderSearchStore.files}
            view="FOLDER"
        />
    </section>
    <section
        class="file-container"
        style:display={states.view === "FILE" ? "initial" : "none"}
    >
        <Container
            footObserver={observer}
            files={fileSearchStore.files}
            view="FILE"
        />
        <!-- <FileContainer {observer} /> -->
    </section>
</div>

<style>
    .search-content {
        padding: var(--content-padding);
        padding-top: 0rem;
    }

    @media (max-width: 600px) {
    }
</style>
