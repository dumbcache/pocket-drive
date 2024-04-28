<script lang="ts">
    import FileContainer from "$lib/components/files/FileContainer.svelte";
    import FolderContainer from "$lib/components/folders/FolderContainer.svelte";

    import { activeParent, fileStore, folderStore } from "$lib/scripts/stores";
    import {
        FOLDER_MIME_TYPE,
        fetchMultiple,
        IMG_MIME_TYPE,
        getToken,
    } from "$lib/scripts/utils";
    import { onMount } from "svelte";
    import FileLoading from "./utils/FileLoading.svelte";
    import imgCreate from "$lib/assets/imgCreate.svg?raw";
    import folderCreate from "$lib/assets/folderCreate.svg?raw";

    export let view: string;
    export let count: number;
    let observer: IntersectionObserver;
    let footer: HTMLElement;
    let nextPageToken: string | undefined;
    let mimeType: string;
    let status = "";
    $: status =
        view === "FOLDER"
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
                                    parent: $activeParent.id,
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

<div class="content" on:dragstart|preventDefault>
    <FolderContainer {observer} {view} />
    <FileContainer {observer} {view} />
</div>

{#if count > 0}
    <footer bind:this={footer}>
        <FileLoading {status} />
    </footer>
{:else}
    <div class="no-content">
        {#if view === "FILE"}
            <p>No Data</p>
            <p>
                Click <span class="img">{@html imgCreate}</span> or Drag and Drop
                to upload.
            </p>
        {:else}
            <p>No Data</p>
            <p>
                Click <span class="img">{@html folderCreate}</span> to create
            </p>
        {/if}
    </div>
{/if}

<style>
    .content {
        padding: 2rem 5rem;
    }
    footer {
        display: flex;
        justify-content: center;
        align-items: center;
        padding: 1rem 0rem;
    }
    .no-content {
        display: flex;
        flex-flow: column nowrap;
        gap: 0.5rem;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #555;
        text-align: center;
        user-select: none;
    }
    .img {
        vertical-align: bottom;
        display: inline-flex;
        align-items: center;
        width: var(--primary-icon-size);
        height: var(--primary-icon-size);
    }
    .img :global(svg) {
        fill: #555;
    }
    @media (max-width: 600px) {
        .content {
            padding: 2rem 1rem;
        }
        footer {
            padding: 2rem 0rem;
        }
        .no-content {
            font-size: smaller;
        }
        .img {
            min-width: 2rem;
            min-height: 2rem;
        }
    }
</style>
