<script lang="ts">
    import { onDestroy } from "svelte";
    import { folderStore, folderAction, starred } from "$lib/scripts/stores";
    import Folder from "$lib/components/folders/Folder.svelte";
    import { navigating } from "$app/stores";
    import ActionForm from "$lib/components/folders/ActionForm.svelte";
    import FolderSelect from "$lib/components/folders/FolderSelect.svelte";

    export let view: string;
    export let observer: IntersectionObserver;

    let folders: FileResponse | undefined;
    let childObserver: IntersectionObserver;
    let inspectionLog = {};

    let foot: HTMLElement;
    let container: HTMLElement;

    $: foot && observer?.observe(foot);

    let unsubscribe = folderStore.subscribe((data) => {
        if (data) {
            folders = data?.files;
            setTimeout(() => {
                childInspection(folders);
            }, 1000);
        }
    });

    let navUnsubscribe = navigating.subscribe((val) => {
        if (!val) {
            inspectionLog = {};
        }
    });

    function childInspection(items: FileResponse | undefined) {
        childObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        let { id } = entry.target.dataset;
                        inspectionLog[id] = true;
                        childObserver.unobserve(entry.target);
                    }
                });
            },
            { threshold: 0 }
        );
        items?.forEach((item) => {
            let id = item.id;
            if (id && !inspectionLog[id]) {
                let li = container?.querySelector(`[data-id="${id}"]`);
                li && childObserver.observe(li);
            }
        });
    }

    function actionHandler(e) {
        folderActionDetail = e.detail;
        folderAction = e.type.toUpperCase();
    }

    function actionClose() {
        folderActionDetail = undefined;
        folderAction = undefined;
    }

    onDestroy(() => {
        unsubscribe();
        navUnsubscribe();
        childObserver?.disconnect();
    });
</script>

<section
    class="folder-container"
    style:display={view === "FOLDER" ? "initial" : "none"}
>
    {#if folders && folders.length > 0}
        <ol class="list" bind:this={container}>
            {#each folders as folder}
                {#key folder.id}
                    <li
                        data-id={folder.id}
                        style:display={$starred === true &&
                        folder.starred === false
                            ? "none"
                            : "initial"}
                    >
                        <Folder {folder} visible={inspectionLog[folder.id]} />
                    </li>
                {/key}
            {/each}
        </ol>
        <div id="folder-foot" bind:this={foot}></div>
    {/if}
</section>

{#if $folderAction}
    {#if $folderAction === "MOVE"}
        <FolderSelect type="FOLDER" />
    {:else}
        <ActionForm />
    {/if}
{/if}

<style>
    .list {
        padding-top: var(--vertical-padding);
        display: flex;
        flex-flow: row wrap;
        align-items: flex-start;
        justify-content: center;
        gap: var(--content-gap);
    }

    @media (max-width: 600px) {
        .list {
            justify-content: space-evenly;
        }
    }

    @media (orientation: landscape) {
        .list {
            justify-content: center;
        }
    }
</style>
