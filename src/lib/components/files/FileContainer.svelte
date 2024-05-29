<script lang="ts">
    import { onDestroy } from "svelte";
    import { fileStore, mode } from "$lib/scripts/stores";
    import File from "$lib/components/files/File.svelte";
    import Edit from "$lib/components/files/Edit.svelte";
    import { navigating } from "$app/stores";
    import { handleImageClick } from "$lib/scripts/utils";
    import View from "./View.svelte";

    export let view: string;
    export let observer: IntersectionObserver;

    let files: FileResponse | undefined;
    let childObserver: IntersectionObserver;
    let inspectionLog = {};

    let foot: HTMLElement;
    let container: HTMLElement;

    $: foot && observer?.observe(foot);

    let unsubscribe = fileStore.subscribe((data) => {
        if (data) {
            files = data?.files;
            setTimeout(() => {
                childInspection(files);
            }, 1000);
        }
    });

    let navUnsubscribe = navigating.subscribe((data) => {
        if (!data) {
            inspectionLog = {};
        }
    });

    onDestroy(() => {
        unsubscribe();
        navUnsubscribe();
        childObserver?.disconnect();
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
</script>

<section
    class="file-container"
    style:display={view === "FILE" ? "initial" : "none"}
>
    {#if files && files.length > 0}
        <ol
            class="list"
            bind:this={container}
            on:click={handleImageClick}
            on:keydown
        >
            {#each files as file}
                {#key file.id}
                    <li data-id={file.id}>
                        <File {file} visible={inspectionLog[file.id]} />
                    </li>
                {/key}
            {/each}
        </ol>
        <div id="file-foot" bind:this={foot}></div>
    {/if}
</section>

{#if $mode === "view"}
    <View {files} />
{/if}

{#if $mode === "edit"}
    <Edit {files} />
{/if}

<style>
    .list {
        display: flex;
        flex-flow: row wrap;
        align-items: flex-start;
        justify-content: center;
        gap: var(--content-gap);
    }

    @media (max-width: 600px) {
    }
</style>
