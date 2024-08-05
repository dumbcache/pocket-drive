<script lang="ts">
    import File from "$lib/components/files/File.svelte";
    import ViewMode from "$lib/components/files/ViewMode.svelte";
    import Container from "$lib/components/Container.svelte";
    import { preferences, states, fsStore } from "$lib/scripts/state.svelte";
    import FetchAll from "$lib/components/utils/FetchAll.svelte";

    let { observer }: { observer: IntersectionObserver | undefined } = $props();
</script>

{#if fsStore?.nextPageToken}
    <FetchAll view="FILE" />
{/if}

<!-- {#key $refresh} -->
<Container
    files={fsStore.files}
    view="FILE"
    component={File}
    footObserver={observer}
    showFileNames={preferences.showFileNames}
/>
<!-- {/key} -->

{#if states.mode === "VIEW"}
    <ViewMode files={fsStore.files} />
{/if}
