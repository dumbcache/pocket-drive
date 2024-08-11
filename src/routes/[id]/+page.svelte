<script lang="ts">
    import { onMount } from "svelte";
    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import Content from "$lib/components/Content.svelte";
    import Search from "$lib/components/search/Search.svelte";
    import ScrollButton from "$lib/components/utils/ScrollButton.svelte";
    import {
        states,
        folderStore,
        fileStore,
        tempStore,
        storeSnap,
    } from "$lib/scripts/stores.svelte";
    import Header from "$lib/components/header/Header.svelte";

    let { data }: { data: PageData } = $props();

    $effect(() => {
        if (data) {
            fileStore.set(data.files);
            folderStore.set(data.folders);
            tempStore.activeFolder = data.activeFolder;
        }
    });

    function check() {
        // states.view = "FOLDER";
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

<div class="page" style:display="">
    <!-- {#if states.mode !== "EDIT"} -->
    <Header />
    {#if states.mode === "SEARCH"}
        <Search />
    {/if}
    <!-- {/if} -->
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
</div>

<style>
    .page {
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

    @media (max-width: 600px) {
        .page {
            padding: 0rem 0.5rem;
        }
    }
</style>
