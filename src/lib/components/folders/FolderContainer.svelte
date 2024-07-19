<script lang="ts">
    import { onDestroy } from "svelte";
    import { folderStore, folderAction } from "$lib/scripts/stores";
    import Folder from "$lib/components/folders/Folder.svelte";
    import ActionForm from "$lib/components/folders/ActionForm.svelte";
    import FolderSelect from "$lib/components/folders/FolderSelect.svelte";
    import Container from "$lib/components/Container.svelte";
    import { navigating } from "$app/stores";

    export let view: "FILE" | "FOLDER";
    export let observer: IntersectionObserver;

    let files: FileResponse | undefined;

    let unsubscribeFolderStore = folderStore.subscribe((data) => {
        if (data) {
            files = data?.files;
        }
    });

    onDestroy(() => {
        unsubscribeFolderStore();
    });
</script>

<section
    class="folder-container"
    style:display={view === "FOLDER" ? "initial" : "none"}
>
    {#key files}
        <Container
            {files}
            view="FOLDER"
            component={Folder}
            footObserver={observer}
        />
    {/key}
</section>

{#if $folderAction}
    {#if $folderAction === "MOVE"}
        <FolderSelect type="FOLDER" />
    {:else}
        <ActionForm />
    {/if}
{/if}
