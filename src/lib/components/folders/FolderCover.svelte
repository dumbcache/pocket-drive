<script lang="ts">
    import { IMG_MIME_TYPE, fetchMultiple } from "$lib/scripts/gdrive/utils";
    import ActionButtons from "$lib/components/folders/ActionButtons.svelte";
    import Favorite from "$lib/components/actions/Favorite.svelte";
    import { getToken } from "$lib/scripts/shared/utils";
    import { previewAndSetDropItems } from "$lib/scripts/shared/image";

    export let visible: Boolean;
    export let toolsVisible: Boolean;
    export let id: string;
    export let name: string;
    export let starred: Boolean;
    let draggedOver = false;
    let pics: FileResponse = [];

    $: visible &&
        fetchMultiple(
            { parent: id, mimeType: IMG_MIME_TYPE, pageSize: 3 },
            getToken()
        )
            .then((data) => {
                pics = data?.files;
            })
            .catch(console.warn);

    export function imgDropHandler(e: DragEvent) {
        e.preventDefault();
        draggedOver = false;
        let files = e.dataTransfer?.files;
        if (files) {
            previewAndSetDropItems(files, id, name);
        }
    }
</script>

<div
    class="cover {draggedOver === true ? 'dragover' : ''}"
    on:dragover|preventDefault|stopPropagation={() => (draggedOver = true)}
    on:dragenter|stopPropagation={() => (draggedOver = true)}
    on:dragleave={() => (draggedOver = false)}
    on:drop|stopPropagation={imgDropHandler}
>
    {#if pics.length != 0}
        {#each pics as pic}
            <div class="pic-wrapper pic">
                <img
                    src={pic.thumbnailLink}
                    alt="cover pic"
                    referrerpolicy="no-referrer"
                    on:load={(e) => (e.target.style.display = "initial")}
                    on:error={(e) => (e.target.style.display = "none")}
                />
            </div>
        {/each}
    {:else}
        <div class="pic-wrapper placeholder" />
        <div class="pic-wrapper placeholder" />
        <div class="pic-wrapper placeholder" />
    {/if}
    {#if toolsVisible}
        <div class="edit">
            <ActionButtons type="dir" {id} {name} />
        </div>
        <div class="favorite">
            <Favorite {id} {starred} on:fav />
        </div>
    {/if}
</div>

<style>
    .cover {
        position: relative;
        border: 1px solid var(--color-file-border);
        background-color: var(--color-file-background);
        width: var(--folder-width);
        height: var(--cover-height);
        display: grid;
        grid-template-rows: 60% 40%;
        grid-template-columns: 70% 30%;
        grid-template-areas:
            "one two"
            "one three";
        border-radius: 1rem;
        overflow: hidden;
        cursor: pointer;
    }

    .cover:hover {
        box-shadow: 0 0 2px 2px var(--color-focus);
    }
    .cover:hover .pic {
        filter: brightness(0.6);
        background-color: var(--color-file-hover);
    }
    .cover:hover .placeholder {
        filter: brightness(1);
        background-color: var(--color-file-hover);
    }

    .cover img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
        border: none;
        display: none;
    }

    .cover .pic-wrapper:nth-child(1) {
        grid-area: one;
        border-right: 1px solid var(--color-file-border);
    }
    .cover .pic-wrapper:nth-child(2) {
        grid-area: two;
        border-bottom: 1px solid var(--color-file-border);
    }
    .cover .pic-wrapper:nth-child(3) {
        grid-area: three;
    }

    .favorite {
        position: absolute;
        right: 1rem;
        bottom: 1rem;
    }
    .edit {
        padding: 0.5rem 0.2rem;
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        height: 4rem;
    }

    .favorite,
    .edit {
        opacity: 0;
        transition: opacity 0.3s linear;
    }

    .cover:hover .favorite,
    .cover:hover .edit {
        opacity: 1;
    }

    .dragover {
        box-shadow: 0 0 5px 5px var(--color-focus);
    }
    .dragover .pic {
        filter: brightness(0.2);
    }
    @media (max-width: 600px) {
        .favorite,
        .edit {
            opacity: 1;
        }
        .cover .pic {
            filter: brightness(0.8);
        }

        .edit {
            top: 0rem;
        }
        .favorite {
            right: 0.7rem;
            bottom: 0rem;
        }
    }
</style>
