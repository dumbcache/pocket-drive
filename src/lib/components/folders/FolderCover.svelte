<script lang="ts">
    import ActionButtons from "$lib/components/folders/ActionButtons.svelte";
    import { getToken, IMG_MIME_TYPE, fetchMultiple } from "$lib/scripts/utils";
    import { previewAndSetDropItems } from "$lib/scripts/image";
    import { storeSnap } from "$lib/scripts/stores";
    import { goto } from "$app/navigation";

    export let visible: Boolean;
    export let toolsVisible: Boolean;
    export let id: string;
    export let name: string;
    let draggedOver = false;
    let pics: FileResponse = [];
    let hover = false;

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

    function dirNavigate(e: MouseEvent) {
        storeSnap();
        goto(`/${id}`);
    }
</script>

<button
    class="cover {draggedOver === true ? 'dragover' : ''}"
    class:hover
    on:click={dirNavigate}
    on:dragover|preventDefault|stopPropagation={() => (draggedOver = true)}
    on:dragenter|stopPropagation={() => (draggedOver = true)}
    on:dragleave={() => (draggedOver = false)}
    on:drop|stopPropagation={imgDropHandler}
>
    {#if pics?.length != 0}
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
    {/if}
</button>

<style>
    .cover {
        display: grid;
        position: relative;
        border: 1px solid var(--color-file-border);
        background-color: var(--color-file-background);
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
        background-color: var(--color-file-hover);
    }
    .cover:hover .placeholder {
        filter: brightness(1);
        background-color: var(--color-file-hover);
    }

    .cover .pic-wrapper:nth-child(1) {
        grid-area: one;
        border-right: 1px solid var(--color-file-border);
        height: 100%;
    }
    .cover .pic-wrapper:nth-child(2) {
        grid-area: two;
        border-bottom: 1px solid var(--color-file-border);
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
    .hover {
        filter: brightness(0.5);
    }

    .edit {
        padding: 0.5rem 0.2rem;
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        height: 4rem;
    }

    .edit {
        opacity: 0;
        transition: opacity 0.3s linear;
    }

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
        .edit {
            top: 0rem;
        }
    }
</style>
