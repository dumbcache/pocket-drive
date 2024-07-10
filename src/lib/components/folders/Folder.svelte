<script lang="ts">
    import FolderCover from "$lib/components/folders/FolderCover.svelte";
    import Favorite from "../utils/Favorite.svelte";

    export let visible: Boolean;
    export let toolsVisible: Boolean = true;
    export let folder: Folder;
</script>

<div
    class="card"
    role="listitem"
    on:dragstart|preventDefault
    data-id={folder.id}
>
    <!-- on:mouseleave={closePeak}
    on:mouseenter={displayPeak} -->
    <FolderCover id={folder.id} name={folder.name} {toolsVisible} {visible} />
    <div class="title-wrapper">
        <h2 class="folder-title" title={folder.name}>{folder.name}</h2>
        <div class="favorite">
            <Favorite
                id={folder.id}
                starred={folder.starred}
                on:fav={() => (folder.starred = !folder.starred)}
            />
        </div>
    </div>
</div>

<style>
    .card {
        position: relative;
    }
    .card:hover {
        /* box-shadow: 0 0 2px 2px var(--color-focus); */
        transform: scale(1.01);
    }

    .card {
        width: var(--folder-width);
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
        border-bottom-left-radius: 1rem;
        border-bottom-right-radius: 1rem;
        /* border: 1px solid var(--color-border); */
        border-top: none;
    }

    .favorite {
        margin-right: 1rem;
        height: var(--secondary-icon-size);
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
