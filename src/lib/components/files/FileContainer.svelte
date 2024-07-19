<script lang="ts">
    import { onDestroy } from "svelte";
    import { fileStore, mode, preferences } from "$lib/scripts/stores";
    import File from "$lib/components/files/File.svelte";
    import ViewMode from "$lib/components/files/ViewMode.svelte";
    import Container from "$lib/components/Container.svelte";
    import { navigating } from "$app/stores";

    export let view: "FILE" | "FOLDER";
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

<section
    class="file-container"
    style:display={view === "FILE" ? "initial" : "none"}
>
    {#key files}
        <Container
            {files}
            view="FILE"
            component={File}
            footObserver={observer}
            {showFileNames}
        />
    {/key}
</section>

{#if $mode === "view"}
    <ViewMode {files} />
{/if}
