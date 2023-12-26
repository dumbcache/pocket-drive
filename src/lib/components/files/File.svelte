<script lang="ts">
    import linkIcon from "$lib/assets/link.svg?raw";
    import urlIcon from "$lib/assets/url.svg?raw";
    import { isValidUrl } from "$lib/scripts/shared/utils";
    import { mode } from "$lib/scripts/shared/stores";
    import Favorite from "../actions/Favorite.svelte";

    export let visible: Boolean;
    export let file: File;

    let selected = "";
</script>

<div class="card" class:select={selected} class:edit-mode={""}>
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
        {#if $mode !== "edit"}
            {#if file.appProperties?.origin || file.description}
                <a
                    href={isValidUrl(file.appProperties?.origin) ||
                        isValidUrl(file.description)}
                    class="img-link btn"
                    referrerpolicy="no-referrer"
                    rel="external noopener noreferrer nofollow"
                    on:click|stopPropagation
                >
                    {@html urlIcon}
                </a>
            {/if}

            <span class="favorite btn">
                <Favorite
                    id={file.id}
                    starred={file.starred}
                    on:favStatus={() => (file.starred = !file.starred)}
                />
            </span>
        {/if}
    {:else}
        <div class="placeholder"></div>
    {/if}
</div>

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
    }
    .card:hover {
        outline: 1px solid var(--color-focus);
    }
    .edit-mode {
        cursor: pointer;
    }
    .card:hover .img {
        filter: brightness(0.5);
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
        /* width: var(--size-small);
        height: var(--size-small); */
        /* filter: none; */
        padding: 0.5rem;
    }
    .favorite {
        bottom: 0.5rem;
    }
    .img-link:hover :global(svg) {
        fill: red;
    }
    .img-link {
        display: block;
        top: 0.5rem;
    }
    .img-link :global(svg) {
        fill: var(--color-white);
        /* filter: none; */
    }

    .img {
        display: block;
        overflow: hidden;
        height: fit-content;
        max-width: var(--file-width);
        border: none;
        border: 1px solid var(--color-file-border);
    }
    .placeholder {
        width: 20rem;
        height: 20rem;
        border: 1px solid var(--color-file-border);
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
        /* width: 2px; */
        position: absolute;
        top: 0;
        left: 0;
        z-index: -1;
    }

    @media (max-width: 600px) {
        .img-link,
        .favorite {
            opacity: unset;
        }
        .favorite {
            bottom: 0.2rem;
        }
        .img-link,
        .favorite {
            width: var(--size-default);
            height: var(--size-default);
            padding: 0rem;
        }
        .placeholder {
            width: 30vw;
            height: 10rem;
            background-color: var(--color-file-background);
            border: 1px solid var(--color-file-border);
        }
    }
</style>
