<script lang="ts">
    import File from "$lib/components/files/File.svelte";
    import View from "$lib/components/files/View.svelte";
    import Container from "$lib/components/Container.svelte";
    import { preferences, states, fileStore } from "$lib/scripts/stores.svelte";
    import FetchAll from "$lib/components/utils/FetchAll.svelte";

    let { observer }: { observer: IntersectionObserver | undefined } = $props();
</script>

{#if fileStore?.nextPageToken}
    <FetchAll view="FILE" />
{/if}

<!-- {#key $refresh} -->
<Container
    files={fileStore.files}
    view="FILE"
    component={File}
    footObserver={observer}
    showFileNames={preferences.showFileNames}
/>
<!-- {/key} -->

{#if states.mode === "VIEW"}
    <View />
{/if}
