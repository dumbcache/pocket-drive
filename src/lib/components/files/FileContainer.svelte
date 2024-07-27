<script lang="ts">
    import { onDestroy } from "svelte";
    import { fileStore, mode, preferences, refresh } from "$lib/scripts/stores";
    import File from "$lib/components/files/File.svelte";
    import ViewMode from "$lib/components/files/ViewMode.svelte";
    import Container from "$lib/components/Container.svelte";

    export let observer: IntersectionObserver;

    let files: FileResponse | undefined;
    let showFileNames = false;

    let unsubscribeFileStore = fileStore.subscribe((data) => {
        if (data) {
            files = data?.files;
        }
    });

    let preferencesUnsubscribe = preferences.subscribe((val) => {
        showFileNames = val?.showFileNames;
    });

    onDestroy(() => {
        unsubscribeFileStore();
        preferencesUnsubscribe();
    });
</script>

<!-- {#key $refresh} -->
<Container
    {files}
    view="FILE"
    component={File}
    footObserver={observer}
    {showFileNames}
/>
<!-- {/key} -->

{#if $mode === "view"}
    <ViewMode {files} />
{/if}
