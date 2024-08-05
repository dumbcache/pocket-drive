<script lang="ts">
    import Folder from "$lib/components/folders/Folder.svelte";
    import ActionForm from "$lib/components/folders/ActionForm.svelte";
    import FolderSelect from "$lib/components/folders/FolderSelect.svelte";
    import Container from "$lib/components/Container.svelte";
    import { states, folderStore, tempStore } from "$lib/scripts/state.svelte";
    import FetchAll from "$lib/components/utils/FetchAll.svelte";

    let { observer }: { observer: IntersectionObserver | undefined } = $props();
</script>

{#if folderStore?.nextPageToken}
    <FetchAll view="FOLDER" />
{/if}

<!-- {#key $refresh} -->
<Container
    files={folderStore.files}
    view="FOLDER"
    component={Folder}
    footObserver={observer}
/>
<!-- {/key} -->

{#if tempStore.folderAction.type && states.mode !== "SEARCH"}
    {#if tempStore.folderAction.type === "MOVE"}
        <FolderSelect type="FOLDER" />
    {:else}
        <ActionForm />
    {/if}
{/if}
