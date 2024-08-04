<script lang="ts">
    // import { onDestroy } from "svelte";
    import {
        // fileStore,
        mode,
        // preferences,
        //  refresh
    } from "$lib/scripts/stores";
    import File from "$lib/components/files/File.svelte";
    import ViewMode from "$lib/components/files/ViewMode.svelte";
    import Container from "$lib/components/Container.svelte";
    import { appPreferences, fsStore } from "$lib/scripts/state.svelte";

    // export let observer: IntersectionObserver;
    let { observer }: { observer: IntersectionObserver } = $props();

    // let files: DriveFile[] = fsStore.files;
    // let showFileNames = appPrefernces.showFileNames;

    // let unsubscribeFileStore = fileStore.subscribe((data) => {
    //     if (data) {
    //         files = data?.files;
    //     }
    // });

    // let preferencesUnsubscribe = preferences.subscribe((val) => {
    //     showFileNames = val?.showFileNames;
    // });

    // onDestroy(() => {
    //     unsubscribeFileStore();
    //     preferencesUnsubscribe();
    // });
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
    <ViewMode {files} />
{/if}
