<script lang="ts">
    import FileContainer from "$lib/components/files/FileContainer.svelte";
    import FolderContainer from "$lib/components/folders/FolderContainer.svelte";
</script>

<main class="content">
    <FolderContainer />
    <FileContainer />
</main>

<style>
    .content {
        display: flex;
        flex-flow: column;
        min-height: 100vh;
        width: 100%;
    }
</style>
