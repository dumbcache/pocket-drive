<script lang="ts">
    import imgCreate from "$lib/assets/imgCreate.svg?raw";
    import folderCreate from "$lib/assets/folderCreate.svg?raw";
    import { previewAndSetDropItems } from "$lib/scripts/image";
    import {
        activeParent,
        activeView,
        fetchAll,
        fileStore,
        folderAction,
        folderStore,
        pocketStore,
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
    } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";
    import { navigating } from "$app/stores";
    import { onDestroy } from "svelte";
    import { get } from "svelte/store";

    let view: "FILE" | "FOLDER";
    let refreshing = false;

    function imgPickerHandler(e: InputEvent) {
        e.preventDefault();
        const target = e.target as HTMLInputElement;
        if (target.files) {
            previewAndSetDropItems(target.files);
        }
    }

    async function refreshHandler() {
        refreshing = true;
        const token = getToken();
        const parent = $activeParent.id;

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

        $folderStore?.files.forEach((file) => {
            fetchMultiple(
                { parent: file.id, mimeType: IMG_MIME_TYPE, pageSize: 3 },
                token,
                true,
                true
            );
        });

        let fs = await fetchMultiple(
            { parent, mimeType: IMG_MIME_TYPE },
            token,
            true
        );
        let fd = await fetchMultiple(
            { parent, mimeType: FOLDER_MIME_TYPE },
            token,
            true
        );
        if (parent === get(activeParent).id) {
            folderStore.set(fd);
            fileStore.set(fs);
            if ($fileStore?.nextPageToken || $folderStore?.nextPageToken) {
                fetchAll.set(true);
            }
        }
        $refresh = !$refresh;
        pocketStore.delete(parent);
        refreshing = false;
    }

    const unsubscribeNavigation = navigating.subscribe((val) => {
        if (!val) {
            $starred = false;
        }
    });

    const unsubscribeView = activeView.subscribe(
        (data) => data && (view = data)
    );

    onDestroy(() => {
        unsubscribeView();
        unsubscribeNavigation();
    });
</script>

<div class="tools">
    <button
        class="view btn s-prime"
        title="folders"
        on:click={() => activeView.set("FOLDER")}
        class:active={view === "FOLDER"}
    >
        {@html folderIcon}
    </button>
    <button
        class="view btn s-prime"
        title="files"
        on:click={() => activeView.set("FILE")}
        class:active={view === "FILE"}
    >
        {@html fileIcon}
    </button>
    <hr class="hr" />

    {#if $activeView === "FILE"}
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
            title="create folder"
            on:click={() => folderAction.set("CREATE")}
        >
            {@html folderCreate}
        </button>
    {/if}
    <button
        class="btn s-prime"
        title="edit"
        on:click={() => {
            mode.set("edit");
        }}
    >
        {@html editIcon}
    </button>
    <button
        class="btn s-prime"
        title="search folders"
        on:click={() => mode.set($mode === "" ? "search" : "")}
    >
        {@html searchIcon}
    </button>
    <button
        class="btn s-prime"
        title="favorites"
        class:favorites={$starred}
        on:click={() => starred.set(!$starred)}
    >
        {@html favoriteIcon}
    </button>
    <button
        class="btn s-prime"
        class:refreshing
        title="refresh"
        on:click={refreshHandler}
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
        height: 1px;
        background-color: var(--color-border);
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
