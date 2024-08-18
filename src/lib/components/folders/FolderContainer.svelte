<script lang="ts">
    import ActionForm from "$lib/components/folders/ActionForm.svelte";
    import FolderSelect from "$lib/components/folders/FolderSelect.svelte";
    import Container from "$lib/components/Container.svelte";
    import { states, folderStore, tempStore } from "$lib/scripts/stores.svelte";
    import FetchAll from "$lib/components/utils/FetchAll.svelte";
    import Select from "$lib/components/folders/Select.svelte";

    let { observer }: { observer: IntersectionObserver | undefined } = $props();
</script>

{#if folderStore?.nextPageToken}
    <FetchAll view="FOLDER" />
{/if}

{#key states.refresh}
    <Container
        files={folderStore.files}
        view="FOLDER"
        footObserver={observer}
    />
{/key}

{#if tempStore.folderAction.type && states.mode !== "SEARCH"}
    {#if tempStore.folderAction.type === "MOVE"}
        <Select />
    {:else}
        <ActionForm />
    {/if}
{/if}
