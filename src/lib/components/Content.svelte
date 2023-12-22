<script lang="ts">
    import FileContainer from "$lib/components/files/FileContainer.svelte";
    import FolderContainer from "$lib/components/folders/FolderContainer.svelte";
    import {
        FOLDER_MIME_TYPE,
        fetchMultiple,
        IMG_MIME_TYPE,
    } from "$lib/scripts/gdrive/utils";
    import { fileStore, folderStore } from "$lib/scripts/shared/stores";
    import { getToken } from "$lib/scripts/shared/utils";
    import { activeParentId } from "$lib/scripts/stores";
    import { onMount } from "svelte";
    import FileLoading from "./FileLoading.svelte";

    export let view: string;
    let observer: IntersectionObserver;
    let footer: HTMLElement;
    let nextPageToken: string | undefined;
    let mimeType: string;
    let status = "";
    $: status =
        view === "folder"
            ? $folderStore?.nextPageToken
                ? ""
                : "completed"
            : $fileStore?.nextPageToken
              ? ""
              : "completed";

    onMount(() => {
        setupIntersectionObserver();
    });

    function setupIntersectionObserver() {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting && status === "") {
                        let ele = entry.target.id;
                        status = "loading";
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
                                    parent: $activeParentId,
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

<main class="content">
    <FolderContainer {observer} {view} />
    <FileContainer {observer} {view} />
</main>

<footer bind:this={footer}>
    <FileLoading {status} />
</footer>

<style>
    .content {
    }
    footer {
        display: flex;
        justify-content: center;
        align-items: center;
    }

    @media (max-width: 600px) {
        footer {
            padding: 2rem 0rem;
        }
    }
</style>
