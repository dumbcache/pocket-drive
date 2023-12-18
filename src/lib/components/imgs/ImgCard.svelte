<script lang="ts">
    import linkIcon from "$lib/assets/link.svg?raw";
    import { fetchImgPreview } from "$lib/scripts/utils";
    import { isValidUrl } from "$lib/scripts/shared/utils";
    import {
        blobLocations,
        dropMini,
        editItems,
        editMode,
        mode,
        previewItem,
        selectAll,
        selectedCount,
        view,
    } from "$lib/scripts/stores";
    import imgPlaceholder from "$lib/assets/imgPlaceholder.svg";
    import Favorite from "../actions/Favorite.svelte";

    export let img: GoogleFile;
    let selected: Boolean;
    $: selected = $selectAll;
    function handleImgclick(e) {
        // const view = document.getElementById("view")?.showModal();
        if ($mode !== "select") {
            $dropMini = true;
            if ($previewItem?.id !== img.id) {
                // const { url } = e.currentTarget.dataset;
                let url = $blobLocations[img.id] || "";
                if (url) {
                    $previewItem = { id: img.id, src: img.thumbnailLink!, url };
                    return;
                }
                $previewItem = { id: img.id, src: img.thumbnailLink! };
                fetchImgPreview($previewItem.id);
            }
        } else {
            selected = !selected;
            if (selected) {
                $selectedCount = $selectedCount + 1;
                let temp = [...$editItems, img.id];
                $editItems = temp;
            } else {
                $selectedCount = $selectedCount - 1;
                $editItems = $editItems.filter((entry) => entry !== img.id);
            }
        }
    }
</script>

<div
    class="img-card"
    class:select={selected}
    data-id={img.id}
    data-url={$blobLocations[img.id] || ""}
    class:edit-mode={$editMode}
    on:click={handleImgclick}
    on:keypress={handleImgclick}
>
    <img
        src={img.thumbnailLink}
        alt="thumbnail to link"
        class="img {$mode === 'delete' ? 'delete' : ''}"
        loading="lazy"
        height="200"
        width="200"
        on:error={(e) => (e.target.src = imgPlaceholder)}
    />
    <button class="anchor">.</button>
    {#if !$editMode}
        {#if img.appProperties?.origin || img.description}
            <a
                href={isValidUrl(img.appProperties?.origin) ||
                    isValidUrl(img.description)}
                class="img-link"
                referrerpolicy="no-referrer"
                rel="external noopener noreferrer nofollow"
                on:click|stopPropagation
            >
                {@html linkIcon}
            </a>
        {/if}

        <div class="favorite">
            <Favorite
                id={img.id}
                starred={img.starred}
                on:favStatus={() => (img.starred = !img.starred)}
            />
        </div>
    {/if}
</div>

<style>
    .img-card {
        position: relative;
        background-color: var(--content-background-color);
        border-radius: 1rem;
        border: none;
        height: fit-content;
        max-height: 50rem;
        overflow: hidden;
        cursor: zoom-in;
    }
    .edit-mode {
        cursor: pointer;
    }
    .img-card:hover .img {
        filter: brightness(0.5);
    }
    .img-card:hover .img-link,
    .img-card:hover .favorite {
        opacity: 1;
    }

    .favorite,
    .img-link {
        position: absolute;
        right: 0.5rem;
        opacity: 0;
        transition: opacity 0.3s linear;
        width: var(--size-small);
        height: var(--size-small);
        filter: none;
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
        filter: none;
    }

    .img {
        display: block;
        overflow: hidden;
        height: fit-content;
        max-width: var(--img-width);
        border-radius: 1rem;
        border: none;
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
        }
    }
</style>
