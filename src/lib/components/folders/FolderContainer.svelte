<script lang="ts">
    import ActionForm from "$lib/components/folders/ActionForm.svelte";
    import Container from "$lib/components/Container.svelte";
    import {
        states,
        folderStore,
        tempStore,
        folderSearchStore,
    } from "$lib/scripts/stores.svelte";
    import FetchAll from "$lib/components/utils/FetchAll.svelte";
    import Select from "$lib/components/folders/Select.svelte";
</script>

{#if folderStore?.nextPageToken}
    <FetchAll view="FOLDER" />
{/if}

{#if states.searchMode}
    <Container files={folderSearchStore.files} view="FOLDER" />
{:else}
    {#key states.refresh}
        <Container files={folderStore.files} view="FOLDER" />
    {/key}
{/if}

{#if tempStore.folderAction.type && !states.searchMode}
    {#if tempStore.folderAction.type === "MOVE"}
        <Select />
    {:else}
        <ActionForm />
    {/if}
{/if}
