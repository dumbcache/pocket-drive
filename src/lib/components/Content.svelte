<script lang="ts">
    import FileContainer from "$lib/components/files/FileContainer.svelte";
    import FolderContainer from "$lib/components/folders/FolderContainer.svelte";
    import { states } from "$lib/scripts/stores.svelte";
</script>

<div class="content" role="main" ondragstart={(e) => e.preventDefault()}>
    <section
        class="folder-container"
        style:display={states.view === "FOLDER" ? "initial" : "none"}
    >
        <FolderContainer />
    </section>
    <section
        class="file-container"
        style:display={states.view === "FILE" ? "initial" : "none"}
    >
        <FileContainer />
    </section>
</div>

<style>
    .content {
        padding: var(--content-padding);
        padding-top: 0rem;
        padding-bottom: 0rem;
    }

    @media (max-width: 600px) {
    }
</style>
