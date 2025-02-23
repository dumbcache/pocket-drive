<script lang="ts">
    import imgCreate from "$lib/assets/imgCreate.svg?raw";
    import folderCreate from "$lib/assets/folderCreate.svg?raw";
    import { previewAndSetDropItems } from "$lib/scripts/image";
    import editIcon from "$lib/assets/editMode.svg?raw";
    import folderIcon from "$lib/assets/folder.svg?raw";
    import fileIcon from "$lib/assets/file.svg?raw";
    import searchIcon from "$lib/assets/search.svg?raw";
    import refreshIcon from "$lib/assets/refresh.svg?raw";
    import favoriteIcon from "$lib/assets/favoriteOutlined.svg?raw";

    import {
        FOLDER_MIME_TYPE,
        fetchMultiple,
        IMG_MIME_TYPE,
        clearTempCache,
    } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";
    import { navigating } from "$app/stores";
    import { onDestroy } from "svelte";
    import {
        folderStore,
        fileStore,
        states,
        tempStore,
        pocketStore,
        preferences,
    } from "$lib/scripts/stores.svelte";

    let refreshing = $state(false);

    function imgPickerHandler(e: InputEvent) {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        if (target.files) {
            previewAndSetDropItems(target.files);
        }
    }

    async function refreshHandler() {
        refreshing = true;
        clearTempCache();
        const token = getToken();
        const parent = tempStore.activeFolder!.id;

        fetchMultiple(
            { parent, mimeType: IMG_MIME_TYPE, pageSize: 3 },
            token,
            true
        );

        fetchMultiple(
            { parent, mimeType: FOLDER_MIME_TYPE, pageSize: 500 },
            token,
            true
        );

        folderStore.files.forEach((file) => {
            fetchMultiple(
                { parent: file.id, mimeType: IMG_MIME_TYPE, pageSize: 3 },
                token,
                true,
                true
            );
        });

        let fs = (await fetchMultiple(
            { parent, mimeType: IMG_MIME_TYPE },
            token,
            true
        )) as GoogleDriveResponse<DriveFile>;
        let fd = (await fetchMultiple(
            {
                parent,
                mimeType: FOLDER_MIME_TYPE,
                hidden: preferences.showHidden,
            },
            token,
            true
        )) as GoogleDriveResponse<DriveFolder>;
        if (parent === tempStore.activeFolder!.id) {
            folderStore.set(fd);
            fileStore.set(fs);
        }
        states.refresh = !states.refresh;
        pocketStore.delete(parent);
        refreshing = false;
    }

    const unsubscribeNavigation = navigating.subscribe((val) => {
        if (!val) {
            states.starred = false;
        }
    });

    onDestroy(() => {
        unsubscribeNavigation();
    });
</script>

<div class="tools">
    <button
        class="view btn s-prime"
        title="folders"
        onclick={() => (states.view = "FOLDER")}
        class:active={states.view === "FOLDER"}
    >
        {@html folderIcon}
    </button>
    <button
        class="view btn s-prime"
        title="files"
        onclick={() => (states.view = "FILE")}
        class:active={states.view === "FILE"}
    >
        {@html fileIcon}
    </button>
    <hr class="hr" />

    {#if states.view === "FILE"}
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
                onclick={() => (states.drop = true)}
                onchange={imgPickerHandler}
            />
        </button>
    {:else}
        <button
            class="btn s-prime"
            title="create folder"
            onclick={() => {
                tempStore.folderAction.type = "CREATE";
            }}
        >
            {@html folderCreate}
        </button>
    {/if}
    <button
        class="btn s-prime"
        title="edit"
        onclick={() => {
            states.mode = "EDIT";
        }}
    >
        {@html editIcon}
    </button>
    <button
        class="btn s-prime"
        title="search"
        onclick={() => (states.searchMode = !states.searchMode)}
    >
        {@html searchIcon}
    </button>
    <button
        class="btn s-prime"
        title="favorites"
        class:favorites={states.starred}
        onclick={() => (states.starred = !states.starred)}
    >
        {@html favoriteIcon}
    </button>
    <button
        class="btn s-prime"
        class:refreshing
        title="refresh"
        onclick={refreshHandler}
    >
        {@html refreshIcon}
    </button>
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
        height: 3px;
        background-color: var(--color-lite);
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
        border: 2px solid var(--color-focus);
        position: absolute;
        top: 0;
        left: -0.5rem;
        background-color: var(--color-focus);
    }

    .favorites :global(svg) {
        fill: var(--color-red);
    }

    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
    .refreshing {
        animation: spin 1s infinite linear;
        -webkit-animation: spin 1s infinite linear;
    }
    @media (max-width: 600px) {
        .tools {
            flex-flow: row nowrap;
            gap: 0.6rem;
        }
        .active::before {
            width: 100%;
            height: 10%;
            border-width: 1px;
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
