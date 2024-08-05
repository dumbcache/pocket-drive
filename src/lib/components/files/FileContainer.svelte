<script lang="ts">
    import { mode } from "$lib/scripts/stores";
    import File from "$lib/components/files/File.svelte";
    import ViewMode from "$lib/components/files/ViewMode.svelte";
    import Container from "$lib/components/Container.svelte";
    import { appPreferences, fsStore } from "$lib/scripts/state.svelte";

    let { observer }: { observer: IntersectionObserver | undefined } = $props();
</script>

<!-- {#key $refresh} -->
<Container
    files={fsStore.files}
    view="FILE"
    component={File}
    footObserver={observer}
    showFileNames={appPreferences.showFileNames}
/>
<!-- {/key} -->

{#if $mode === "view"}
    <ViewMode files={fsStore.files} />
{/if}
