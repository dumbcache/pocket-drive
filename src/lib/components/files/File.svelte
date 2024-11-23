<script lang="ts">
    import outIcon from "$lib/assets/outArrow.svg?raw";
    import urlIcon from "$lib/assets/url.svg?raw";
    import playIcon from "$lib/assets/play.svg?raw";
    import { isValidUrl } from "$lib/scripts/utils";
    import Favorite from "$lib/components/utils/Favorite.svelte";
    import { intersectionLog, states } from "$lib/scripts/stores.svelte";

    let {
        file,
        showFileNames = false,
    }: {
        file: DriveFile;
        showFileNames?: boolean;
    } = $props();

    let selected = "";
</script>

<div
    class="card"
    title={file.name}
    class:select={selected}
    class:edit-mode={states.mode === "EDIT"}
>
    {#if intersectionLog.has(file.id)}
        <img
            src={file.thumbnailLink}
            data-id={file.id}
            alt=""
            class="img {states.mode === 'DELETE' ? 'DELETE' : ''}"
            loading="lazy"
            height="200"
            width="200"
            referrerpolicy="no-referrer"
            onerror={() => intersectionLog.delete(file.id)}
        />
        <button class="anchor">.</button>
        {#if file.mimeType.match("video/")}
            <div class="play">{@html playIcon}</div>
        {/if}
        {#if states.mode !== "EDIT"}
            {#if file.description}
                <a
                    href={isValidUrl(file.description)}
                    class="img-link btn s-second"
                    referrerpolicy="no-referrer"
                    rel="external noopener noreferrer nofollow"
                    title={file.description}
                    onclick={(e) => e.stopPropagation()}
                >
                    {@html urlIcon}
                </a>
            {/if}

            <span class="favorite">
                <Favorite
                    id={file.id}
                    starred={file.starred}
                    toggle={() => (file.starred = !file.starred)}
                />
            </span>
            {#if states.searchMode && file.parents && file.parents.length > 0}
                <a
                    href={file.parents[0]}
                    class="btn s-second goto"
                    title="goto containing folder"
                    target="_blank">{@html outIcon}</a
                >
            {/if}
        {/if}
    {:else}
        <div class="placeholder"></div>
    {/if}
</div>
{#if showFileNames}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <p
        class="name"
        onclick={(e) => {
            e.stopPropagation();
        }}
    >
        {file.name}
    </p>
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
        background-color: var(--color-bg-one);
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
        filter: brightness(0.7);
    }

    .card:hover .img-link,
    .card:hover .goto,
    .card:hover .favorite {
        opacity: 1;
    }

    .favorite,
    .img-link,
    .goto {
        position: absolute;
        right: 0.5rem;
        opacity: 0;
        transition: opacity 0.3s linear;
    }
    .favorite {
        bottom: 0.5rem;
    }
    .img-link,
    .goto {
        display: inline-block;
        top: 0.5rem;
        background-color: #0002;
        border-radius: 50%;
    }
    .img-link :global(svg) {
        fill: var(--color-white);
    }
    .img-link:hover :global(svg) {
        fill: var(--color-focus);
    }

    .goto {
        top: unset;
        bottom: 1rem;
        right: 3.5rem;
        background-color: var(--color-bg);
        padding: 0.2rem;
    }

    .img {
        display: block;
        overflow: hidden;
        height: fit-content;
        max-width: var(--file-width);
        max-height: var(--file-height);
        /* border: none; */
        border: 1px solid var(--color-lite);
        object-fit: cover;
        object-position: top;
    }
    .placeholder {
        width: var(--file-width);
        height: var(--file-width);
        border: 1px solid var(--color-lite);
        background-color: var(--color-bg-one);
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
        .favorite,
        .goto {
            opacity: unset;
        }
        .favorite {
            bottom: 0.2rem;
        }
        .goto {
            bottom: 0.7rem;
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
