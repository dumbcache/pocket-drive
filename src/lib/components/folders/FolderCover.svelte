<script lang="ts">
    import ActionButtons from "$lib/components/folders/ActionButtons.svelte";
    import { IMG_MIME_TYPE, fetchMultiple } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";
    import { previewAndSetDropItems } from "$lib/scripts/image";
    import { intersectionLog, states } from "$lib/scripts/stores.svelte";

    let {
        id,
        name,
    }: {
        id: string;
        name: string;
    } = $props();

    let draggedOver = $state(false);
    let pics: FileResponse = $state([]);

    $effect(() => {
        intersectionLog.has(id) &&
            fetchMultiple(
                { parent: id, mimeType: IMG_MIME_TYPE, pageSize: 3 },
                getToken()
            )
                .then((data) => {
                    pics = data?.files;
                })
                .catch(console.warn);
    });

    export function imgDropHandler(e: DragEvent) {
        e.preventDefault();
        e.stopPropagation();
        states.drop = true;
        draggedOver = false;
        let files = e.dataTransfer?.files;
        if (files) {
            previewAndSetDropItems(files, id, name);
        }
    }
</script>

<a
    href={id}
    class="cover {draggedOver === true ? 'dragover' : ''}"
    ondragover={(e) => {
        e.preventDefault();
        e.stopPropagation();
        draggedOver = true;
    }}
    ondragenter={(e) => {
        e.stopPropagation();
        draggedOver = true;
    }}
    ondragleave={() => (draggedOver = false)}
    ondrop={imgDropHandler}
>
    {#if pics?.length != 0}
        {#each pics as pic}
            <div class="pic-wrapper pic">
                <img
                    src={pic.thumbnailLink}
                    alt="cover pic"
                    referrerpolicy="no-referrer"
                    onload={(e) => (e.target.style.display = "initial")}
                    onerror={(e) => (e.target.style.display = "none")}
                />
            </div>
        {/each}
    {:else}
        <div class="pic-wrapper placeholder"></div>
        <div class="pic-wrapper placeholder"></div>
        <div class="pic-wrapper placeholder"></div>
    {/if}
    {#if states.mode !== "EDIT"}
        <div class="edit">
            <ActionButtons {id} {name} />
        </div>
    {/if}
</a>

<style>
    .cover {
        display: grid;
        position: relative;
        border: 1px solid var(--color-lite);
        background-color: var(--color-bg-one);
        width: var(--folder-width);
        height: var(--cover-height);
        grid-template-rows: 60% 40%;
        grid-template-columns: 65% 35%;
        grid-template-areas:
            "one two"
            "one three";
        border-top-left-radius: 1rem;
        border-top-right-radius: 1rem;
        overflow: hidden;
        cursor: pointer;
        transition: transform 0.1s ease-in-out;
    }

    .cover:hover .pic {
        filter: brightness(0.6);
    }
    .cover:hover .placeholder {
        filter: brightness(0.6);
        background-color: var(--color-lite);
    }

    .cover .pic-wrapper:nth-child(1) {
        grid-area: one;
        border-right: 1px solid var(--color-lite);
        height: 100%;
    }
    .cover .pic-wrapper:nth-child(2) {
        grid-area: two;
        border-bottom: 1px solid var(--color-lite);
        height: 100%;
    }
    .cover .pic-wrapper:nth-child(3) {
        grid-area: three;
        height: 100%;
    }

    img {
        width: 100%;
        height: 100%;
        object-fit: cover;
        object-position: top;
        border: none;
        display: block;
    }

    .edit {
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
    }

    .edit {
        opacity: 0;
        transition: opacity 0.3s linear;
    }

    .cover:hover .edit {
        opacity: 1;
    }

    .dragover {
        box-shadow: 0 0 5px 1px var(--color-focus);
    }
    .dragover .pic {
        filter: brightness(0.2);
    }
    @media (max-width: 600px) {
        .edit {
            top: 0rem;
        }
    }
</style>
