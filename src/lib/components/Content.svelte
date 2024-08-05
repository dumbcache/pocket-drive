<script lang="ts">
    import { onMount } from "svelte";
    import FileContainer from "$lib/components/files/FileContainer.svelte";
    import FolderContainer from "$lib/components/folders/FolderContainer.svelte";
    import { fileStore, folderStore } from "$lib/scripts/stores";
    import {
        FOLDER_MIME_TYPE,
        fetchMultiple,
        IMG_MIME_TYPE,
    } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";
    import Spinner from "$lib/components/utils/Spinner.svelte";
    import { states, fdStore, fsStore, temp } from "$lib/scripts/state.svelte";

    let observer = $state<IntersectionObserver>();
    let nextPageToken: string | undefined;
    let mimeType: string;
    let status = $derived(
        states.view === "FOLDER"
            ? fdStore?.nextPageToken
                ? "loading"
                : "completed"
            : fsStore?.nextPageToken
              ? "loading"
              : "completed"
    );

    onMount(() => {
        setupIntersectionObserver();
    });

    function setupIntersectionObserver() {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && status === "") {
                        let ele = entry.target.id;
                        // status = "loading";
                        if (ele === "folder-foot") {
                            nextPageToken = $folderStore?.nextPageToken;
                            mimeType = FOLDER_MIME_TYPE;
                        } else {
                            nextPageToken = $fileStore?.nextPageToken;
                            mimeType = IMG_MIME_TYPE;
                        }
                        if (nextPageToken) {
                            fetchMultiple(
                                {
                                    parent: temp.activeFolder!.id,
                                    mimeType: mimeType,
                                    pageToken: nextPageToken,
                                },
                                getToken()
                            ).then((data) => {
                                ele === "folder-foot"
                                    ? folderStore.update((prev) => {
                                          return {
                                              nextPageToken: data.nextPageToken,
                                              files: [
                                                  ...prev?.files,
                                                  ...data.files,
                                              ],
                                          };
                                      })
                                    : fileStore.update((prev) => {
                                          return {
                                              nextPageToken: data.nextPageToken,
                                              files: [
                                                  ...prev?.files,
                                                  ...data.files,
                                              ],
                                          };
                                      });
                            });
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

<footer>
    {#if status === "loading"}
        <Spinner height="4rem" width="4rem" />
    {/if}
    <!-- <FileLoading {status} /> -->
</footer>

<style>
    .content {
        padding: var(--content-padding);
        padding-top: 0rem;
    }
    footer {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem 0rem;
    }

    @media (max-width: 600px) {
        footer {
            padding: 2rem 0rem;
        }
    }
</style>
