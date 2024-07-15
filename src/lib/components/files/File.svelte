<script lang="ts">
    import urlIcon from "$lib/assets/url.svg?raw";
    import playIcon from "$lib/assets/play.svg?raw";
    import { isValidUrl } from "$lib/scripts/utils";
    import { mode } from "$lib/scripts/stores";
    import Favorite from "$lib/components/utils/Favorite.svelte";

    export let visible: Boolean;
    export let file: File;
    export let showFileNames = false;
    let selected = "";
</script>

<div
    class="card"
    title={file.name}
    class:select={selected}
    class:edit-mode={$mode === "edit"}
>
    {#if visible}
        <img
            src={file.thumbnailLink}
            data-id={file.id}
            alt=""
            class="img {$mode === 'delete' ? 'delete' : ''}"
            loading="lazy"
            height="200"
            width="200"
            referrerpolicy="no-referrer"
            on:error={() => (visible = false)}
        />
        <button class="anchor">.</button>
        {#if file.mimeType.match("video/")}
            <div class="play">{@html playIcon}</div>
        {/if}
        {#if $mode !== "edit"}
            {#if file.description}
                <a
                    href={isValidUrl(file.description)}
                    class="img-link btn s-second"
                    referrerpolicy="no-referrer"
                    rel="external noopener noreferrer nofollow"
                    title={file.description}
                    on:click|stopPropagation
                >
                    {@html urlIcon}
                </a>
            {/if}

            <span class="favorite">
                <Favorite
                    id={file.id}
                    starred={file.starred}
                    on:fav={() => (file.starred = !file.starred)}
                />
            </span>
        {/if}
    {:else}
        <div class="placeholder"></div>
    {/if}
</div>
{#if showFileNames}
    <p class="name">{file.name}</p>
{/if}

<style>
    .card {
        position: relative;
        border-radius: 1rem;
        border: none;
        height: fit-content;
        max-height: var(--file-height);
        overflow: hidden;
        cursor: zoom-in;
        background-color: var(--color-file-background);
        transition: transform 0.1s ease-in-out;
    }
    .card:hover {
        /* outline: 2px solid var(--color-focus); */
        /* box-shadow: 0 0 5px 1px var(--color-focus); */
        transform: scale(1.02);
    }
    .edit-mode {
        cursor: pointer;
    }
    .card:hover .img {
        filter: brightness(0.8);
    }

    .card:hover .img-link,
    .card:hover .favorite {
        opacity: 1;
    }

    .favorite,
    .img-link {
        position: absolute;
        right: 0.5rem;
        opacity: 0;
        transition: opacity 0.3s linear;
    }
    .favorite {
        bottom: 0.5rem;
    }
    .img-link {
        display: inline-block;
        top: 0.5rem;
        background-color: #0003;
        border-radius: 50%;
        box-shadow: 0 0 10px 1px #0005;
    }
    .img-link:hover :global(svg) {
        fill: red;
    }
    .img-link :global(svg) {
        fill: var(--color-white);
    }

    .img {
        display: block;
        overflow: hidden;
        height: fit-content;
        max-width: var(--file-width);
        max-height: var(--file-height);
        /* border: none; */
        border: 1px solid var(--color-border);
        object-fit: cover;
        object-position: top;
    }
    .placeholder {
        width: var(--file-width);
        height: var(--file-width);
        border: 1px solid var(--color-border);
        background-color: var(--color-file-background);
    }
    .delete:hover {
        cursor: pointer;
    }
    .select .img,
    .select:hover .img {
        filter: brightness(0.2);
    }

    .anchor {
        display: inline-block;
        height: 5px;
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
    }
    .play {
        width: 4rem;
        height: 4rem;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #0007;
        box-shadow: 0 0 20px 5px #fff;
        border-radius: 50%;
        backdrop-filter: blur(10px);
    }
    .play :global(svg) {
        fill: #fff;
    }

    .name {
        max-width: var(--file-width);
        padding: 0.5rem 0rem;
        font-size: smaller;
        word-wrap: unset;
        white-space: nowrap;
        overflow-x: hidden;
        text-overflow: ellipsis;
        max-height: 3.6rem;
        @supports (-webkit-line-clamp: 2) {
            display: -webkit-box;
            -webkit-box-orient: vertical;
            -webkit-line-clamp: 2;
            overflow: hidden;
            white-space: wrap;
        }
    }

    @media (max-width: 600px) {
        .img-link,
        .favorite {
            opacity: unset;
        }
        .favorite {
            bottom: 0.2rem;
        }
        .img-link {
            padding: 0rem;
        }
        .edit-mode.card .img {
            filter: none;
        }
        .play {
            width: 2rem;
            height: 2rem;
        }
    }
</style>
