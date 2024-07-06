<script lang="ts">
    import imgCreate from "$lib/assets/imgCreate.svg?raw";
    import goToDrive from "$lib/assets/drive.svg?raw";
    import folderCreate from "$lib/assets/folderCreate.svg?raw";
    import { previewAndSetDropItems } from "$lib/scripts/image";
    import {
        activeParent,
        activeView,
        fileStore,
        folderAction,
        folderStore,
        refresh,
        starred,
    } from "$lib/scripts/stores";
    import editIcon from "$lib/assets/editMode.svg?raw";
    import { mode } from "$lib/scripts/stores";
    import folderIcon from "$lib/assets/folder.svg?raw";
    import fileIcon from "$lib/assets/file.svg?raw";
    import searchIcon from "$lib/assets/search.svg?raw";
    import refreshIcon from "$lib/assets/refresh.svg?raw";
    import favoriteIcon from "$lib/assets/favoriteOutlined.svg?raw";

    import {
        FOLDER_MIME_TYPE,
        fetchMultiple,
        IMG_MIME_TYPE,
        getToken,
    } from "$lib/scripts/utils";
    import { navigating } from "$app/stores";
    import { onDestroy } from "svelte";

    let view: "FILE" | "FOLDER";

    const unsubscribeNavigation = navigating.subscribe((val) => {
        if (!val) {
            $starred = false;
        }
    });

    function imgPickerHandler(e: InputEvent) {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        if (target.files) {
            previewAndSetDropItems(target.files);
        }
    }
    function folderActionClose() {
        folderACtion = undefined;
    }

    async function refreshHandler() {
        $refresh = true;
        fileStore.set(
            await fetchMultiple(
                { parent: $activeParent.id, mimeType: IMG_MIME_TYPE },
                getToken(),
                true
            )
        );
        folderStore.set(
            await fetchMultiple(
                { parent: $activeParent.id, mimeType: FOLDER_MIME_TYPE },
                getToken(),
                true
            )
        );
        fetchMultiple(
            { parent: $activeParent.id, mimeType: IMG_MIME_TYPE, pageSize: 3 },
            getToken(),
            true
        );

        $refresh = false;
    }
    const unsubscribeView = activeView.subscribe((data) => (view = data));
    onDestroy(() => {
        unsubscribeView();
        unsubscribeNavigation();
    });
</script>

<div class="tools">
    <button
        class="view btn s-prime"
        title="folders"
        on:click={() => ($activeView = "FOLDER")}
        class:active={view === "FOLDER"}
    >
        {@html folderIcon}
    </button>
    <button
        class="view btn s-prime"
        title="files"
        on:click={() => ($activeView = "FILE")}
        class:active={view === "FILE"}
    >
        {@html fileIcon}
    </button>
    <hr class="hr" />

    {#if $activeView === "FILE"}
        <button
            class="btn s-prime"
            title="edit"
            on:click={() => {
                $mode = "edit";
            }}
        >
            {@html editIcon}
        </button>
        <button class="img-picker btn s-prime">
            <label
                for="img-picker"
                class="button__create-img"
                title="add images"
            >
                {@html imgCreate}
            </label>
            <input
                type="file"
                name="img-picker"
                id="img-picker"
                accept="image/*,video/*"
                multiple
                on:change={imgPickerHandler}
            />
        </button>
    {:else}
        <button
            class="btn s-prime"
            title="search folders"
            on:click={() => ($mode = $mode === "" ? "search" : "")}
        >
            {@html searchIcon}
        </button>
        <button
            class="btn s-prime"
            title="create folder"
            on:click={() => ($folderAction = "CREATE")}
        >
            {@html folderCreate}
        </button>
    {/if}
    <button
        class="btn s-prime"
        title="favorites"
        class:favorites={$starred}
        on:click={() => ($starred = !$starred)}
    >
        {@html favoriteIcon}
    </button>
    <button class="btn s-prime" title="refresh" on:click={refreshHandler}>
        {@html refreshIcon}
    </button>
    <a
        href={`https://drive.google.com/drive/folders/${$activeParent?.id}`}
        referrerpolicy="no-referrer"
        rel="external noopener noreferrer nofollow"
        class="btn s-prime"
        title="open in google drive"
        target="_blank"
    >
        {@html goToDrive}
    </a>
</div>

<style>
    .tools {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        gap: 1rem;
    }

    #img-picker {
        display: none;
    }
    .img-picker * {
        cursor: pointer;
    }
    .hr {
        margin: 1rem 0rem;
        width: 100%;
        border: none;
        height: 1px;
        background-color: var(--color-file-border);
    }

    .active :global(svg) {
        padding: 0.1rem;
    }
    .view {
        position: relative;
    }
    .active::before {
        content: " ";
        height: 100%;
        border: 2px solid red;
        position: absolute;
        top: 0;
        left: -0.5rem;
    }

    .favorites :global(svg) {
        fill: red;
    }
    @media (max-width: 600px) {
        .tools {
            flex-flow: row nowrap;
            gap: 0.6rem;
        }
        .active::before {
            width: 100%;
            height: 10%;
            border: 1px solid red;
            top: unset;
            bottom: 0;
            left: 0;
        }
        .hr {
            transform: rotate(90deg);
            width: 2rem;
        }
    }
</style>
