<script lang="ts">
    import { onMount } from "svelte";
    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import Content from "$lib/components/Content.svelte";
    import Tools from "$lib/components/Tools.svelte";
    import Count from "$lib/components/utils/Count.svelte";
    import BackButton from "$lib/components/utils/BackButton.svelte";
    import Search from "$lib/components/utils/Search.svelte";
    import ScrollButton from "$lib/components/utils/ScrollButton.svelte";
    import FolderTitle from "$lib/components/utils/FolderTitle.svelte";
    import {
        states,
        folderStore,
        fileStore,
        tempStore,
        storeSnap,
    } from "$lib/scripts/stores.svelte";

    let { data }: { data: PageData } = $props();

    $effect(() => {
        if (data) {
            fileStore.set(data.files);
            folderStore.set(data.folders);
            tempStore.activeFolder = data.activeFolder;
        }
    });

    function check() {
        states.view = "FOLDER";
        if (folderStore.files.length === 0 && fileStore.files.length !== 0) {
            states.view = "FILE";
        }
    }

    afterNavigate(() => {
        states.mode = "";
        check();
    });

    beforeNavigate(({ from, to }) => {
        try {
            if (from?.url?.href === to?.url?.href) return;
            storeSnap(
                fileStore.get(),
                folderStore.get(),
                tempStore.activeFolder
            );
        } catch (error) {
            console.warn(error);
        }
    });

    onMount(() => {
        check();
    });
</script>

<section class="wrapper" style:display="">
    {#if states.mode !== "EDIT"}
        <nav class="nav">
            <BackButton />
            <div class="tool-wrapper">
                <Tools />
            </div>

            <h2 class="folder-name one">
                <FolderTitle />
            </h2>

            <Count
                count={states.view === "FOLDER"
                    ? folderStore.files.length
                    : fileStore.files.length}
            />
        </nav>

        <h2 class="folder-name two">
            <FolderTitle />
        </h2>

        {#if states.mode === "SEARCH"}
            <Search />
        {/if}
    {/if}
    <main
        class="main"
        style:display={states.mode === "SEARCH" ? "none" : "block"}
    >
        <Content />
        {#if states.mask}
            <div class="mask"></div>
        {/if}
    </main>

    <ScrollButton />
</section>

<style>
    .wrapper {
        background: inherit;
        width: 100%;
        padding: 0rem;
    }
    .main {
        position: relative;
        background: inherit;
    }
    .mask {
        width: 100%;
        height: 100%;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: #5555;
        backdrop-filter: blur(5rem);
    }
    .tool-wrapper {
        display: none;
    }
    .nav {
        width: 100%;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: flex-end;
        padding: 2rem 0rem;
        position: sticky;
        top: 0;
        background-color: var(--color-bg);
        z-index: 1;
        gap: 5rem;
    }
    .nav :global(.back-button) {
        position: absolute;
        top: 50%;
        left: 0%;
        transform: translate(0%, -50%);
        margin-left: 2rem;
    }

    .folder-name {
        font-size: 2rem;
        max-width: 40rem;
        width: fit-content;
        word-wrap: unset;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        margin: auto;
        padding: 1rem;
    }

    .two {
        display: none;
    }

    @media (max-width: 600px) {
        .wrapper {
            padding: 0rem 0.5rem;
        }

        .tool-wrapper {
            display: initial;
        }
        .nav :global(.back-button) {
            display: none;
        }
        .nav {
            padding: 1.5rem 0.5rem;
            gap: 2rem;
            margin-bottom: 0rem;
        }
        .one {
            display: none;
        }
        .two {
            display: block;
            font-size: initial;
            max-width: 80%;
        }

        .folder-name {
            flex-shrink: 0;
            padding: 0.5rem;
        }
    }
</style>
