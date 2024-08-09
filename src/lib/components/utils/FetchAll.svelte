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
                { parent, mimeType: mimeType, pageToken: pageToken },
                token
            );
            pageToken = res?.nextPageToken;
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
        <div class="loading">
            <Spinner width={"2rem"} height={"2rem"} borderWidth={"2px"} />
        </div>
    {:else}
        <button class="btn s-second" onclick={clickHandler}>
            {@html fetchAllIcon}
        </button>
    {/if}
</div>

<style>
    .fetch-all {
        position: fixed;
        top: 7rem;
        right: 7rem;
        z-index: 1;
    }

    .fetch-all :global(svg) {
        fill: var(--color-five);
    }

    @media (max-width: 600px) {
        .fetch-all {
            position: absolute;
            top: -1rem;
            right: 1rem;
            z-index: unset;
        }
    }
</style>
