<script lang="ts">
    import { onDestroy } from "svelte";
    import {
        folderStore,
        folderAction,
        refresh,
        mode,
    } from "$lib/scripts/stores";
    import Folder from "$lib/components/folders/Folder.svelte";
    import ActionForm from "$lib/components/folders/ActionForm.svelte";
    import FolderSelect from "$lib/components/folders/FolderSelect.svelte";
    import Container from "$lib/components/Container.svelte";

    export let observer: IntersectionObserver;

    let files: FileResponse | undefined;

    let unsubscribeFolderStore = folderStore.subscribe((data) => {
        if (data) {
            files = data?.files;
        }
    });

    onDestroy(() => {
        unsubscribeFolderStore();
    });
</script>

<!-- {#key $refresh} -->
<Container {files} view="FOLDER" component={Folder} footObserver={observer} />
<!-- {/key} -->

{#if $folderAction && $mode !== "search"}
    {#if $folderAction === "MOVE"}
        <FolderSelect type="FOLDER" />
    {:else}
        <ActionForm />
    {/if}
{/if}
