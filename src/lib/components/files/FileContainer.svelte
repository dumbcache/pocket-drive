<script lang="ts">
    import View from "$lib/components/files/View.svelte";
    import Container from "$lib/components/Container.svelte";
    import {
        preferences,
        states,
        fileStore,
        fileSearchStore,
    } from "$lib/scripts/stores.svelte";
    import FetchAll from "$lib/components/utils/FetchAll.svelte";
</script>

{#if fileStore?.nextPageToken && states.mode !== "EDIT"}
    <FetchAll view="FILE" />
{/if}

{#if states.searchMode}
    <Container
        files={fileSearchStore.files}
        view="FILE"
        showFileNames={preferences.showFileNames}
    />
{:else}
    {#key states.refresh}
        <Container
            files={fileStore.files}
            view="FILE"
            showFileNames={preferences.showFileNames}
        />
    {/key}
{/if}

{#if states.mode === "VIEW"}
    <View />
{/if}
