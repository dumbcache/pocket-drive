<script lang="ts">
    import FileContainer from "$lib/components/files/FileContainer.svelte";
    import FolderContainer from "$lib/components/folders/FolderContainer.svelte";
    import folderIcon from "$lib/assets/folder.svg?raw";
    import fileIcon from "$lib/assets/file.svg?raw";

    let view: "folder" | "file" = "folder";
</script>

<main class="content">
    <nav class="nav">
        <button
            class=""
            on:click={() => (view = "folder")}
            class:active={view === "folder"}
        >
            <span class="btn">
                {@html folderIcon}
            </span>
        </button>
        <button
            class=""
            on:click={() => (view = "file")}
            class:active={view === "file"}
            ><span class="btn">
                {@html fileIcon}
            </span>
        </button>
    </nav>
    <FolderContainer {view} />
    <FileContainer {view} />
</main>

<style>
    .content {
        /* display: flex; */
        flex-flow: column;
        min-height: 100vh;
        width: 100%;
        padding: 2rem;
    }
    .nav {
        width: fit-content;
        margin-left: auto;
        margin-bottom: 5rem;
    }

    button {
        padding: 0.5rem;
        background-color: var(--color-black-one);
        width: 5rem;
    }

    .active {
        background-color: var(--color-black-three);
        border-bottom: 1px solid var(--color-focus);
    }
    /* .active :global(svg) {
        fill: var(--color-focus);
    } */

    @media (max-width: 600px) {
        .content {
            padding: 1rem;
        }
        .nav {
            margin-bottom: 2rem;
        }
    }
</style>
