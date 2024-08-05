<script lang="ts">
    import { folderAction } from "$lib/scripts/stores";
    import Folder from "$lib/components/folders/Folder.svelte";
    import ActionForm from "$lib/components/folders/ActionForm.svelte";
    import FolderSelect from "$lib/components/folders/FolderSelect.svelte";
    import Container from "$lib/components/Container.svelte";
    import { appStates, fdStore } from "$lib/scripts/state.svelte";
    import FetchAll from "$lib/components/utils/FetchAll.svelte";

    let { observer }: { observer: IntersectionObserver | undefined } = $props();
</script>

{#if fdStore?.nextPageToken}
    <FetchAll view="FOLDER" />
{/if}

<!-- {#key $refresh} -->
<Container
    files={fdStore.files}
    view="FOLDER"
    component={Folder}
    footObserver={observer}
/>
<!-- {/key} -->

{#if $folderAction && appStates.mode !== "search"}
    {#if $folderAction === "MOVE"}
        <FolderSelect type="FOLDER" />
    {:else}
        <ActionForm />
    {/if}
{/if}
