<script lang="ts">
    import DirCover from "$lib/components/dirs/DirCover.svelte";

    export let folder: Folder;
    let draggedOver = false;
</script>

<li
    class="dir-card {draggedOver === true ? 'dragover' : ''}"
    on:dragstart|preventDefault
    on:dragover|preventDefault
    on:dragenter={() => (draggedOver = true)}
    on:dragleave={() => (draggedOver = false)}
    on:drop|stopPropagation
    data-id={folder.id}
>
    <button on:click>
        <DirCover
            id={folder.id}
            name={folder.name}
            starred={folder.starred}
            on:editDir
            on:deleteDir
            on:favStatus={() => (folder.starred = !folder.starred)}
        />
    </button>
    <h2 class="dir-title">{folder.name}</h2>
</li>

<style>
    .dir-card {
        position: relative;
    }
    button {
        filter: none;
    }
    .dir-card {
        width: var(--dir-width);
    }
</style>
