<script lang="ts">
    import { goto } from "$app/navigation";
    import FolderCover from "$lib/components/folders/FolderCover.svelte";

    export let visible: Boolean;
    export let folder: Folder;
    function dirNavigate(e: MouseEvent) {
        goto(`/${folder.id}`);
    }
</script>

<div class="card" on:dragstart|preventDefault data-id={folder.id}>
    <button on:click={dirNavigate}>
        <FolderCover
            id={folder.id}
            name={folder.name}
            starred={folder.starred}
            {visible}
            on:fav={() => (folder.starred = !folder.starred)}
        />
    </button>
    <h2 class="dir-title">{folder.name}</h2>
</div>

<style>
    .card {
        position: relative;
    }
    button {
        filter: none;
    }
    .card {
        width: var(--dir-width);
    }
</style>
