<script lang="ts">
    import fetchAllIcon from "$lib/assets/fetchAll.svg?raw";
    import { getToken } from "$lib/scripts/login";
    import {
        folderStore,
        fileStore,
        tempStore,
    } from "$lib/scripts/stores.svelte";
    import {
        fetchMultiple,
        FOLDER_MIME_TYPE,
        IMG_MIME_TYPE,
    } from "$lib/scripts/utils";
    import Spinner from "$lib/components/utils/Spinner.svelte";

    let { view }: { view: View } = $props();
    let loading = $state(false);

    async function clickHandler() {
        let token = getToken();
        let parent = tempStore.activeFolder?.id;
        if (!parent) return;
        let pageToken =
            view === "FOLDER"
                ? folderStore.nextPageToken
                : fileStore.nextPageToken;
        let mimeType = view === "FOLDER" ? FOLDER_MIME_TYPE : IMG_MIME_TYPE;
        loading = true;
        while (pageToken) {
            let res = await fetchMultiple(
                {
                    parent,
                    mimeType: mimeType,
                    pageToken: pageToken,
                    pageSize: 1000,
                },
                token
            );
            pageToken = res?.nextPageToken;
            if (parent !== tempStore.activeFolder?.id) return;
            if (view === "FOLDER") {
                folderStore.nextPageToken = pageToken;
                folderStore.files.push(...(res.files as DriveFolder[]));
            } else {
                fileStore.nextPageToken = pageToken;
                fileStore.files.push(...(res.files as DriveFile[]));
            }
        }
        loading = false;
    }
</script>

<div class="fetch-all">
    {#if loading}
        <Spinner width={"1.6rem"} height={"1.6rem"} borderWidth={"2px"} />
    {:else}
        <button class="btn" title="fetch all" onclick={clickHandler}>
            {@html fetchAllIcon}
        </button>
    {/if}
</div>

<style>
    .fetch-all {
        position: fixed;
        top: 10.5rem;
        right: 7rem;
        z-index: 1;
        display: flex;
        align-items: center;
    }

    .btn {
        width: 2rem;
        height: 2rem;
    }
    .fetch-all :global(svg) {
        fill: var(--color-focus);
    }

    @media (max-width: 600px) {
        .fetch-all {
            top: 9.5rem;
            right: 0.5rem;
        }
    }
</style>
