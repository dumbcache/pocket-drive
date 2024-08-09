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
    import Head from "$lib/components/header/Head.svelte";
    import Crumbs from "$lib/components/header/Crumbs.svelte";

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
        <Head />
        {#if states.mode === "SEARCH"}
            <Search />
        {/if}

        <section class="utils">
            <div class="tools">
                <Tools />
            </div>
            <div class="count">
                <Count
                    count={states.view === "FOLDER"
                        ? folderStore.files.length
                        : fileStore.files.length}
                />
            </div>
        </section>

        <div class="crumbs">
            <BackButton />
            <span>
                <Crumbs />
            </span>
        </div>
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

    .utils {
        z-index: 1;
    }
    .tools {
        position: fixed;
        top: 50%;
        left: 0;
        transform: translate(0%, -50%);
        padding: 2rem;
        z-index: 1;
    }
    .count {
        position: fixed;
        right: 0;
        top: 7rem;
        z-index: 1;
    }
    .crumbs {
        display: none;
    }
    @media (max-width: 600px) {
        .wrapper {
            padding: 0rem 0.5rem;
        }

        .utils {
            position: sticky;
            top: 0;
            background: inherit;
            display: flex;
            justify-content: space-between;
            align-items: center;
            padding: 1rem;
        }
        .crumbs {
            display: flex;
            align-items: center;
            padding: 1rem 0rem;
            /* gap: 1rem; */
            /* margin: auto; */
            /* justify-content: start; */
        }

        .crumbs span {
            margin: auto;
            width: fit-content;
            /* flex-grow: 1;
            width: 100%;
            text-align: center; */
        }
        .count,
        .tools {
            position: unset;
        }
        .tools {
            padding: 0rem;
            transform: unset;
        }
    }
</style>
