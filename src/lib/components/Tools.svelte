<script lang="ts">
    import imgCreate from "$lib/assets/imgCreate.svg?raw";
    import goToDrive from "$lib/assets/drive.svg?raw";
    import folderCreate from "$lib/assets/folderCreate.svg?raw";
    import { previewAndSetDropItems } from "$lib/scripts/shared/image";
    import {
        activeParent,
        folderActionToggle,
        activeView,
        folderAction,
    } from "$lib/scripts/shared/stores";
    import ActionForm from "$lib/components/folders/ActionForm.svelte";
    import editIcon from "$lib/assets/editMode.svg?raw";
    import { mode } from "$lib/scripts/shared/stores";
    import folderIcon from "$lib/assets/folder.svg?raw";
    import fileIcon from "$lib/assets/file.svg?raw";
    import historyIcon from "$lib/assets/history.svg?raw";

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

    activeView.subscribe((data) => (view = data));
</script>

<div class="tools">
    <button
        class="view btn"
        on:click={() => ($activeView = "FOLDER")}
        class:active={view === "FOLDER"}
    >
        {@html folderIcon}
    </button>
    <button
        class="view btn"
        on:click={() => ($activeView = "FILE")}
        class:active={view === "FILE"}
    >
        {@html fileIcon}
    </button>
    <hr class="hr" />

    {#if $activeView === "FILE"}
        <button
            class="edit-button btn"
            title="edit mode"
            on:click={() => {
                $mode = "edit";
            }}
        >
            {@html editIcon}
        </button>
        <button class="btn img-picker">
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
        <button class="history-button btn">
            {@html historyIcon}
        </button>
        <button
            class="folder-button btn"
            title="create folder"
            on:click={() => ($folderAction = "CREATE")}
        >
            {@html folderCreate}
        </button>
    {/if}
    <a
        href={`https://drive.google.com/drive/folders/${$activeParent.id}`}
        referrerpolicy="no-referrer"
        rel="external noopener noreferrer nofollow"
        class="drive-button btn"
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
    button.active::before {
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
        button.active::before {
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
