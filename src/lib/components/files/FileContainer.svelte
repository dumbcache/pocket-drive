<script lang="ts">
    import View from "$lib/components/files/View.svelte";
    import Container from "$lib/components/Container.svelte";
    import { preferences, states, fileStore } from "$lib/scripts/stores.svelte";
    import FetchAll from "$lib/components/utils/FetchAll.svelte";

    let { observer }: { observer: IntersectionObserver | undefined } = $props();
</script>

{#if fileStore?.nextPageToken && states.mode !== "EDIT"}
    <FetchAll view="FILE" />
{/if}

<!-- {#key $refresh} -->
<Container
    files={fileStore.files}
    view="FILE"
    footObserver={observer}
    showFileNames={preferences.showFileNames}
/>
<!-- {/key} -->

{#if states.mode === "VIEW"}
    <View />
{/if}
