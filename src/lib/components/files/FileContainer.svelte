<script lang="ts">
    import { onDestroy } from "svelte";
    import { fileStore } from "$lib/scripts/shared/stores";
    import File from "./File.svelte";

    export let view: string;
    export let observer: IntersectionObserver;

    let files: FileResponse | undefined;
    let inspectionLog = {};

    let foot: HTMLElement;

    $: foot && observer?.observe(foot);

    let unsubscribe = fileStore.subscribe((data) => {
        if (data) {
            files = data?.files;
        }
    });

    onDestroy(() => {
        unsubscribe();
    });
</script>

<section
    class="file-container"
    style:display={view === "file" ? "initial" : "none"}
>
    {#if files && files.length > 0}
        <ol class="list">
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

<style>
    .file-container {
        padding-top: 10rem;
    }

    .list {
        display: flex;
        flex-flow: row wrap;
        align-items: flex-start;
        justify-content: center;
        gap: var(--content-gap);
    }

    @media (max-width: 600px) {
        .file-container {
            padding-top: 5rem;
        }
    }
</style>
