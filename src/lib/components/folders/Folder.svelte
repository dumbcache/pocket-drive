<script lang="ts">
    import FolderCover from "$lib/components/folders/FolderCover.svelte";
    import { states } from "$lib/scripts/stores.svelte";
    import Favorite from "../utils/Favorite.svelte";

    let {
        visible,
        file,
    }: {
        visible: boolean;
        file: DriveFolder;
    } = $props();
</script>

<div
    class="card"
    class:edit-mode={states.mode === "EDIT"}
    role="listitem"
    ondragstart={(e) => e.preventDefault()}
    data-id={file.id}
>
    {#key states.refresh}
        <FolderCover id={file.id} name={file.name} {visible} />
    {/key}
    <div class="title-wrapper">
        <h2 class="folder-title" title={file.name}>{file.name}</h2>
        <div class="favorite">
            <Favorite
                id={file.id}
                starred={file.starred}
                toggle={() => (file.starred = !file.starred)}
            />
        </div>
    </div>
    {#if states.mode === "EDIT"}
        <div class="mask"></div>
    {/if}
</div>

<style>
    .card {
        position: relative;
        /* border-radius: 1rem; */
        border-top-left-radius: 1rem;
        border-top-right-radius: 1rem;
        overflow: hidden;
    }
    .card:hover {
        /* box-shadow: 0 0 2px 2px var(--color-focus); */
        transform: scale(1.01);
    }

    .card {
        width: var(--folder-width);
    }
    .edit-mode {
        cursor: pointer;
    }
    .folder-title {
        word-wrap: unset;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .title-wrapper {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 1rem;
        background-color: var(--color-bg-one);
        /* border-bottom-left-radius: 1rem;
        border-bottom-right-radius: 1rem; */
        /* border: 1px solid var(--color-border); */
        border-top: none;
    }

    .favorite {
        margin-right: 1rem;
        height: var(--secondary-icon-size);
    }

    .mask {
        position: absolute;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        border-radius: 1rem;
    }

    @media (max-width: 900px) {
        .favorite {
            margin-right: 0.7rem;
        }
        .title-wrapper {
            padding: 0.5rem;
        }
    }
</style>
