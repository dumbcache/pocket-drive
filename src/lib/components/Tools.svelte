<script lang="ts">
    import imgCreate from "$lib/assets/imgCreate.svg?raw";
    import goToDrive from "$lib/assets/drive.svg?raw";
    import folderCreate from "$lib/assets/folderCreate.svg?raw";
    import { previewAndSetDropItems } from "$lib/scripts/shared/image";
    import {
        activeParent,
        activeView,
        fileStore,
        folderAction,
        folderStore,
        refresh,
    } from "$lib/scripts/shared/stores";
    import editIcon from "$lib/assets/editMode.svg?raw";
    import { mode } from "$lib/scripts/shared/stores";
    import folderIcon from "$lib/assets/folder.svg?raw";
    import fileIcon from "$lib/assets/file.svg?raw";
    import historyIcon from "$lib/assets/history.svg?raw";
    import refreshIcon from "$lib/assets/refresh.svg?raw";
    import {
        FOLDER_MIME_TYPE,
        fetchMultiple,
        IMG_MIME_TYPE,
    } from "$lib/scripts/gdrive/utils";
    import { getToken } from "$lib/scripts/shared/utils";

    let view: "FILE" | "FOLDER";
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

        $refresh = false;
    }
    activeView.subscribe((data) => (view = data));
</script>

<div class="tools">
    <button
        class="view btn s-prime"
        on:click={() => ($activeView = "FOLDER")}
        class:active={view === "FOLDER"}
    >
        {@html folderIcon}
    </button>
    <button
        class="view btn s-prime"
        on:click={() => ($activeView = "FILE")}
        class:active={view === "FILE"}
    >
        {@html fileIcon}
    </button>
    <hr class="hr" />

    {#if $activeView === "FILE"}
        <button
            class="btn s-prime"
            title="edit mode"
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
                accept="image/*"
                multiple
                on:change={imgPickerHandler}
            />
        </button>
    {:else}
        <button class="btn s-prime">
            {@html historyIcon}
        </button>
        <button
            class="btn s-prime"
            title="create folder"
            on:click={() => ($folderAction = "CREATE")}
        >
            {@html folderCreate}
        </button>
    {/if}
    <button class="btn s-prime" title="create folder" on:click={refreshHandler}>
        {@html refreshIcon}
    </button>
    <a
        href={`https://drive.google.com/drive/folders/${$activeParent.id}`}
        referrerpolicy="no-referrer"
        rel="external noopener noreferrer nofollow"
        class="btn s-prime"
        title="open in Gdrive"
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
    @media (max-width: 600px) {
        .tools {
            flex-flow: row nowrap;
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
            height: 2px;
            width: 2rem;
            color: var(--color-black-light);
        }
    }
</style>
