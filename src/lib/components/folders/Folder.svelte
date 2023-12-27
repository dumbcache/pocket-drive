<script lang="ts">
    import { goto } from "$app/navigation";
    import FolderCover from "$lib/components/folders/FolderCover.svelte";
    import { previewItem } from "$lib/scripts/stores";
    import { updateRecents } from "$lib/scripts/utils";

    export let visible: Boolean;
    export let folder: Folder;
    let draggedOver = false;
    function dirNavigate(e) {
        $previewItem = undefined;
        goto(`/${folder.id}`);
        updateRecents({ name: folder.name, id: folder.id });
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
