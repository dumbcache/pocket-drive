<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { navigating } from "$app/stores";
    import { beforeNavigate } from "$app/navigation";
    import {
        activeParent,
        fileStore,
        folderStore,
        mode,
        mask,
        fetchAll,
        storeSnap,
    } from "$lib/scripts/stores";
    import Content from "$lib/components/Content.svelte";
    import Tools from "$lib/components/Tools.svelte";
    import Count from "$lib/components/utils/Count.svelte";
    import {
        fetchMultiple,
        FOLDER_MIME_TYPE,
        IMG_MIME_TYPE,
    } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";
    import Spinner from "$lib/components/utils/Spinner.svelte";
    import BackButton from "$lib/components/utils/BackButton.svelte";

    import fetchAllIcon from "$lib/assets/fetchAll.svg?raw";
    import Search from "$lib/components/utils/Search.svelte";
    import ScrollButton from "$lib/components/utils/ScrollButton.svelte";
    import FolderTitle from "$lib/components/utils/FolderTitle.svelte";
    import { get } from "svelte/store";
    import { appStates, fdStore, fsStore } from "$lib/scripts/state.svelte";

    let { data }: { data: PageData } = $props();

    $effect(() => {
        if (data) {
            fsStore.set(data.files);
            fdStore.set(data.folders);
        }
    });

    folderStore.set(data.folders);
    fileStore.set(data.files);
    activeParent.set(data.activeFolder);


    let renderAll = $state(false);
    let foldersFetching = $state(false);
    let filesFetching = $state(false);

    function check() {
        appStates.view = "FOLDER";
        if (fdStore.files.length === 0 && fsStore.files.length !== 0) {
            appStates.view = "FILE";
        }
        if (fdStore?.nextPageToken || fsStore?.nextPageToken) {
            renderAll = true;
        }
    }

    // function checks() {
    //     activeView.set("FOLDER");
    //     appStates.view = "FOLDER";
    //     if (
    //         $folderStore?.files.length === 0 &&
    //         $fileStore?.files.length !== 0
    //     ) {
    //         activeView.set("FILE");
    //         appStates.view = "FILE";
    //     }
    //     if ($folderStore?.nextPageToken || $fileStore?.nextPageToken) {
    //         renderAll = true;
    //     }
    // }
    const unsubscribeFetchAll = fetchAll.subscribe((data) => {
        renderAll = data;
    });

    const unsubscribeNavigation = navigating.subscribe((val) => {
        $mode = "";
        if (!val) check();
    });

    // function handlePointerDown(e: PointerEvent) {
    //     if (e.pointerType === "touch") pageX = e.pageX;
    // }

    // function handlePointerUp(e: PointerEvent) {
    //     if (e.pointerType === "touch") {
    //         let diff = pageX - e.pageX;
    //         if (diff > 50) {
    //             $activeView !== "FILE" && ($activeView = "FILE");
    //             return;
    //         }
    //         if (diff < -50) {
    //             $activeView !== "FOLDER" && ($activeView = "FOLDER");
    //         }
    //     }
    // }

    async function fetchFolders(accessToken: string, parent: string) {
        let pToken = $folderStore?.nextPageToken;
        if (!pToken) {
            foldersFetching = false;
            return;
        }
        foldersFetching = true;
        let temp = await fetchMultiple(
            {
                parent: parent,
                mimeType: FOLDER_MIME_TYPE,
                pageToken: pToken,
            },
            accessToken
        );
        if (parent !== data.activeFolder.id) {
            foldersFetching = false;
            return;
        }
        folderStore.update((prev) => {
            return {
                nextPageToken: temp.nextPageToken,
                files: [...prev?.files, ...temp.files],
            };
        });
        return fetchFolders(accessToken, parent);
    }
    async function fetchFiles(accessToken: string, parent: string) {
        let pToken = $fileStore?.nextPageToken;
        if (!pToken) {
            filesFetching = false;
            return;
        }
        filesFetching = true;
        let temp = await fetchMultiple(
            { parent: parent, mimeType: IMG_MIME_TYPE, pageToken: pToken },
            accessToken
        );
        if (parent !== data.activeFolder.id) {
            filesFetching = false;
            return;
        }
        fileStore.update((prev) => {
            return {
                nextPageToken: temp.nextPageToken,
                files: [...prev?.files, ...temp.files],
            };
        });
        return fetchFiles(accessToken, parent);
    }

    async function fetchAllAtOnce() {
        let parent = data.activeFolder.id;
        let accessToken = getToken();
        fetchFolders(accessToken, parent);
        fetchFiles(accessToken, parent);
        renderAll = false;
        fetchAll.set(false);
    }

    beforeNavigate(({ from, to }) => {
        try {
            if (from?.url?.href === to?.url?.href) return;
            renderAll = false;
            storeSnap(get(fileStore), get(folderStore), get(activeParent));
        } catch (error) {
            console.warn(error);
        }
    });

    onMount(() => {
        check();
    });
    onDestroy(() => {
        unsubscribeNavigation();
        unsubscribeFetchAll();
    });
</script>

<section class="wrapper" style:display="">
    {#if $mode !== "edit"}
        <nav class="nav">
            <BackButton />
            <div class="tool-wrapper">
                <Tools />
            </div>

            <h2 class="folder-name one">
                <FolderTitle />
            </h2>

            {#if foldersFetching || filesFetching}
                <div class="loading" on:wheel|preventDefault>
                    <Spinner
                        width={"2rem"}
                        height={"2rem"}
                        borderWidth={"2px"}
                    />
                </div>
            {/if}
            {#if renderAll}
                <button
                    class="btn s-second fetch-all"
                    title="load all"
                    on:click={fetchAllAtOnce}>{@html fetchAllIcon}</button
                >
            {/if}
            <Count
                count={appStates.view === "FOLDER"
                    ? fdStore.files.length
                    : fsStore.files.length}
            />
        </nav>

        <h2 class="folder-name two">
            <FolderTitle />
        </h2>

        {#if $mode === "search"}
            <Search />
        {/if}
    {/if}
    <main class="main" style:display={$mode === "search" ? "none" : "block"}>
        <Content />
        {#if $mask}
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
    .fetch-all {
        background: none;
        padding: 0.5rem;
        box-sizing: content-box;
    }
    .fetch-all :global(svg) {
        fill: var(--color-svg-one);
    }
    .loading,
    .fetch-all {
        position: absolute;
        right: 10rem;
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

        .fetch-all {
            position: absolute;
            top: 5.5rem;
            right: 1rem;
        }
        .loading {
            position: absolute;
            top: 6rem;
            right: 1.5rem;
        }
    }
</style>
