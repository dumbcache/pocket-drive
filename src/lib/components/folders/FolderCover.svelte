<script lang="ts">
    import { IMG_MIME_TYPE, fetchMultiple } from "$lib/scripts/gdrive/utils";
    import EditTool from "$lib/components/actions/EditTool.svelte";
    import Favorite from "$lib/components/actions/Favorite.svelte";
    import { onMount } from "svelte";
    import { getToken } from "$lib/scripts/shared/utils";

    export let visible: Boolean;
    export let id: string;
    export let name: string;
    export let starred: Boolean;
    let pics: FileResponse = [];

    $: visible &&
        fetchMultiple(
            { parent: id, mimeType: IMG_MIME_TYPE, pageSize: 3 },
            getToken()
        )
            .then(({ files }) => {
                pics = files;
            })
            .catch(console.warn);
</script>

<div class="cover">
    {#if pics.length != 0}
        {#each pics as pic}
            <div class="pic-wrapper">
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
        <div class="pic-wrapper" />
        <div class="pic-wrapper" />
        <div class="pic-wrapper" />
    {/if}
    <EditTool type="dir" {id} {name} on:editDir on:deleteDir />
    <div class="favorite">
        <Favorite {id} {starred} on:favStatus />
    </div>
</div>

<style>
    .cover {
        position: relative;
        border: 1px solid var(--cover-border-color);
        background-color: var(--cover-background-color);
        width: var(--dir-width);
        height: var(--cover-height);
        display: grid;
        grid-template-rows: 60% 40%;
        grid-template-columns: 70% 30%;
        grid-template-areas:
            "one two"
            "one three";
        border-radius: 1rem;
        overflow: hidden;
        /* background-color: var(--content-background-color); */
        cursor: pointer;
    }

    /* .cover:hover {
        background-color: var(--content-background-color-hover);
    } */
    .cover:hover .pic-wrapper {
        filter: brightness(0.5);
        background-color: var(--cover-background-color);
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
        border-right: 1px solid var(--cover-border-color);
    }
    .cover .pic-wrapper:nth-child(2) {
        grid-area: two;
        border-bottom: 1px solid var(--cover-border-color);
    }
    .cover .pic-wrapper:nth-child(3) {
        grid-area: three;
    }
    .favorite {
        position: absolute;
        right: 1rem;
        bottom: 1rem;
        /* opacity: 0; */
        transition: opacity 0.3s linear;
        width: var(--size-small);
        height: var(--size-small);
    }
    /* .favorite :global(svg) {
        fill: var(--primary-bg-color);
    } */
    @media (max-width: 600px) {
        .favorite {
            right: 0.5rem;
            bottom: 0.5rem;
            width: var(--size-default);
            height: var(--size-default);
        }
    }
</style>
