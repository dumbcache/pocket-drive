<script lang="ts">
    import imgCreate from "$lib/assets/imgCreate.svg?raw";
    import goToDrive from "$lib/assets/drive.svg?raw";
    import folderCreate from "$lib/assets/folderCreate.svg?raw";
    import searchIcon from "$lib/assets/search.svg?raw";
    import favoriteIcon from "$lib/assets/heart.svg?raw";
    import refresh from "$lib/assets/refresh.svg?raw";
    import swapIcon from "$lib/assets/swap.svg?raw";
    import {
        previewAndSetDropItems,
        handleFavorites,
    } from "$lib/scripts/utils";
    import {
        activeDirs,
        activeImgs,
        activeParentId,
        dropMini,
        favoritesActive,
        mode,
        previewItem,
        refreshClicked,
        reverseActive,
        dirCreateToggle,
    } from "$lib/scripts/stores";
    import DirCreate from "$lib/components/actions/DirCreate.svelte";
    import { refreshCache } from "$lib/scripts/drive";
    import EditIcon from "$lib/components/actions/EditIcon.svelte";
    import History from "$lib/components/actions/History.svelte";

    function imgPickerHandler(e: InputEvent) {
        e.preventDefault();
        // clearDropItems();
        const target = e.target as HTMLInputElement;
        $dropMini = false;
        $previewItem = undefined;
        if (target.files) {
            previewAndSetDropItems(target.files);
        }
    }
</script>

<div class="tools">
    <button
        class="fav-button btn {$favoritesActive === true ? 'clicked' : ''}"
        title="favorites"
        on:click={() => {
            $mode = $mode === "favorites" ? "" : "favorites";
            $favoritesActive = !$favoritesActive;
            handleFavorites();
        }}>{@html favoriteIcon}</button
    >
    <button
        class="reverse-button btn {$reverseActive === true ? 'clicked' : ''}"
        title="reverse listing"
        on:click={() => {
            $reverseActive = !$reverseActive;
            $activeDirs = $activeDirs?.reverse();
            $activeImgs = $activeImgs?.reverse();
        }}
    >
        {@html swapIcon}
    </button>
    <EditIcon />
    <button
        class="search-button btn"
        title="search"
        on:click={() => ($mode = $mode === "search" ? "" : "search")}
    >
        {@html searchIcon}
    </button>
    <History />
    <button
        class="refresh-button btn {$refreshClicked ? 'anime' : ''}"
        title="refresh files"
        on:click={() => {
            refreshCache();
            $favoritesActive = false;
            $reverseActive = false;
        }}
    >
        {@html refresh}
    </button>
    <button class="btn img-picker">
        <label
            for="img-picker"
            class="button__create-img btn"
            title="add images"
        >
            {@html imgCreate}
        </label>
        <input
            type="file"
            name="img-picker"
            id="img-picker"
            accept="image/*"
            multiple
            on:change={imgPickerHandler}
        />
    </button>
    <button
        class="folder-button btn"
        title="create folder"
        on:click={() => ($dirCreateToggle = !$dirCreateToggle)}
    >
        {@html folderCreate}
    </button>
    <a
        href={`https://drive.google.com/drive/folders/${$activeParentId}`}
        referrerpolicy="no-referrer"
        rel="external noopener noreferrer nofollow"
        class="drive-button btn"
        title="open in Gdrive"
    >
        {@html goToDrive}
    </a>

    {#if $dirCreateToggle}
        <DirCreate
            type="create"
            on:dirCreateClose={() => ($dirCreateToggle = false)}
        />
    {/if}
</div>

<style>
    .tools {
        display: flex;
        flex-flow: column nowrap;
        gap: 1rem;
    }
    .reverse-button,
    .fav-button {
        filter: none;
    }
    #img-picker {
        display: none;
    }
    .img-picker * {
        cursor: pointer;
    }
    .clicked :global(svg) {
        fill: red;
    }
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(180deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
    .anime {
        -webkit-animation: spin 1.5s linear 0s infinite;
        animation: spin 1s linear 0s infinite;
    }
    @media (max-width: 600px) {
        .tools {
            flex-flow: row nowrap;
        }
    }
</style>
