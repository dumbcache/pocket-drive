<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import { navigating } from "$app/stores";
    import { afterNavigate, beforeNavigate } from "$app/navigation";
    import {
        activeParent,
        activeView,
        fileStore,
        folderStore,
        mode,
        pocketState,
        storeSnap,
    } from "$lib/scripts/stores";
    import Content from "$lib/components/Content.svelte";
    import Tools from "$lib/components/Tools.svelte";
    import Count from "$lib/components/utils/Count.svelte";
    import Folder from "$lib/components/folders/Folder.svelte";
    import {
        fetchMultiple,
        fetchSingle,
        FOLDER_MIME_TYPE,
        getRoot,
        getToken,
        IMG_MIME_TYPE,
        searchHandler,
    } from "$lib/scripts/utils";
    import Spinner from "$lib/components/utils/Spinner.svelte";
    import BackButton from "$lib/components/utils/BackButton.svelte";
    import scrollDownIcon from "$lib/assets/arrowLeftDouble.svg?raw";
    import fetchAllIcon from "$lib/assets/fetchAll.svg?raw";

    export let data: {
        folders: GoogleFileResponse;
        files: GoogleFileResponse;
        parent: string;
    };
    $: folderStore.set(data.folders);
    $: fileStore.set(data.files);
    let view = $activeView;
    let global = false;
    let search = "";
    let searchFolders: Folder[] = [];
    let searchElement: HTMLInputElement;
    let token = getToken();
    let isScrolling = false;
    let searchTimeout;
    let scrollTimeout;
    let fetchAll = false;
    let foldersFetching = false;
    let filesFetching = false;
    let scrollPosition = window.scrollY;
    let delta = 0;
    let pageX = 0;
    let mask = false;

    function checks() {
        $activeView = "FOLDER";
        if (
            $folderStore?.files.length === 0 &&
            $fileStore?.files.length !== 0
        ) {
            $activeView = "FILE";
        }
        if ($folderStore?.nextPageToken || $fileStore?.nextPageToken) {
            fetchAll = true;
        }
    }

    const unsubscribeNavigation = navigating.subscribe((val) => {
        $mode = "";
        if (!val) checks();
    });
    const unsubscribeView = activeView.subscribe((data) => (view = data));
    const unsubscribeMode = mode.subscribe((data) => {
        // data === "search" && (folders = [...$folderStore?.files]);
        if (data === "") {
            search = "";
            global = false;
            searchFolders = [];
        }
    });
    async function handleChange() {
        if (search.trim() === "") {
            // folders = [...$folderStore?.files];
            searchFolders = [];
            return;
        }
    }
    function handleSearch() {
        clearTimeout(searchTimeout);
        searchTimeout = setTimeout(async () => {
            let val = search.trim();
            if (val === "") {
                // folders = [...$folderStore?.files];
                searchFolders = [];
                return;
            }
            if (global) {
                searchFolders = await searchHandler(token, val);
                return;
            }
            searchFolders = $folderStore?.files.filter((folder) =>
                folder.name.toLowerCase().includes(val.toLowerCase())
            );
        }, 500);
    }

    function handleKeyDown(e: KeyboardEvent) {
        switch (e.key) {
            case "E":
                $mode = "edit";
                return;
            case "s":
                $mode = "search";
                return;
            case "S":
                $mode = "search";
                global = true;
                return;
            case "a":
            case "A":
                mask = !mask;
        }
    }
    function handleScroll(e) {
        let currentScrollPosition = window.scrollY;
        delta = currentScrollPosition - scrollPosition;
        scrollPosition = currentScrollPosition;
        isScrolling = true;
        clearTimeout(scrollTimeout);
        scrollTimeout = setTimeout(() => {
            isScrolling = false;
        }, 1500);
    }

    function handlePointerDown(e: PointerEvent) {
        if (e.pointerType === "touch") pageX = e.pageX;
    }

    function handlePointerUp(e: PointerEvent) {
        if (e.pointerType === "touch") {
            let diff = pageX - e.pageX;
            if (diff > 50) {
                $activeView !== "FILE" && ($activeView = "FILE");
                return;
            }
            if (diff < -50) {
                $activeView !== "FOLDER" && ($activeView = "FOLDER");
            }
        }
    }

    async function fetchFolders(accessToken: string) {
        let pToken = $folderStore?.nextPageToken;
        if (!pToken) {
            foldersFetching = false;
            return;
        }
        foldersFetching = true;
        let temp = await fetchMultiple(
            {
                parent: data.parent,
                mimeType: FOLDER_MIME_TYPE,
                pageToken: pToken,
            },
            accessToken
        );
        folderStore.update((prev) => {
            return {
                nextPageToken: temp.nextPageToken,
                files: [...prev?.files, ...temp.files],
            };
        });
        fetchFolders(accessToken);
    }
    async function fetchFiles(accessToken: string) {
        let pToken = $fileStore?.nextPageToken;
        if (!pToken) {
            filesFetching = false;
            return;
        }
        filesFetching = true;
        let temp = await fetchMultiple(
            { parent: data.parent, mimeType: IMG_MIME_TYPE, pageToken: pToken },
            accessToken
        );
        fileStore.update((prev) => {
            return {
                nextPageToken: temp.nextPageToken,
                files: [...prev?.files, ...temp.files],
            };
        });
        fetchFiles(accessToken);
    }

    async function fetchAllAtOnce() {
        let accessToken = getToken();
        fetchFolders(accessToken);
        fetchFiles(accessToken);
        fetchAll = false;
    }

    afterNavigate(async () => {
        try {
            let parent = data?.parent;
            fetchSingle(parent, "FOLDER", getToken())
                .then((data) => {
                    activeParent.set({
                        id: data.id,
                        name: data.name,
                        parents: data.parents,
                    });
                })
                .catch(console.warn);
            pocketState.set(parent);
        } catch (error) {
            console.warn("afterNavigate function error", error);
        }
    });

    beforeNavigate(() => {
        storeSnap();
    });

    onMount(() => {
        checks();
    });
    onDestroy(() => {
        unsubscribeView();
        unsubscribeNavigation();
        unsubscribeMode();
    });
</script>

<svelte:window on:keydown={handleKeyDown} on:scroll={handleScroll} />

<section class="wrapper" style:display="">
    {#if $mode !== "edit"}
        <nav class="nav">
            <BackButton />
            <div class="tool-wrapper">
                <Tools />
            </div>

            <h2 class="folder-name one">
                {#if $activeParent?.id !== getRoot() && $activeParent?.parents}
                    <a
                        class="title-sub"
                        title="go to parent"
                        href={$activeParent?.parents[0]}>./</a
                    >
                {/if}
                {$activeParent?.name}
            </h2>

            {#if  foldersFetching || filesFetching}
                <div class="loading" on:wheel|preventDefault>
                    <Spinner
                        width={"2rem"}
                        height={"2rem"}
                        borderWidth={"2px"}
                    />
                </div>
            {/if}
            {#if fetchAll}
                <button
                    class="btn s-prime fetch-all"
                    title="load all"
                    on:click={fetchAllAtOnce}>{@html fetchAllIcon}</button
                >
            {/if}
            <Count
                count={view === "FOLDER"
                    ? $folderStore?.files.length
                    : $fileStore?.files.length}
            />
        </nav>

        <h2 class="folder-name two">
            {#if $activeParent?.id !== getRoot() && $activeParent?.parents}
                <a
                    class="title-sub"
                    title="go to parent"
                    href={$activeParent?.parents[0]}>./</a
                >
            {/if}
            {$activeParent?.name}
        </h2>
        {#if $mode === "search"}
            <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
            <div class="search-wrapper" role="form" on:keydown|stopPropagation>
                <button
                    title="global"
                    role="switch"
                    aria-checked="false"
                    class="global"
                    class:active={global}
                    on:click={() => {
                        global = !global;
                        searchElement.focus();
                        handleSearch();
                    }}>/R</button
                >
                <!-- svelte-ignore a11y-autofocus -->
                <input
                    type="search"
                    name="search"
                    id="search"
                    autocomplete="off"
                    autofocus
                    placeholder="search folders"
                    bind:this={searchElement}
                    bind:value={search}
                    on:input={handleSearch}
                    on:change={handleChange}
                />
            </div>

            <section class="folder-container">
                {#if searchFolders && searchFolders.length > 0}
                    <ol class="list">
                        {#each searchFolders as folder (folder.id)}
                            <li data-id={folder.id}>
                                <Folder
                                    {folder}
                                    toolsVisible={false}
                                    visible={true}
                                />
                            </li>
                        {/each}
                    </ol>
                {:else}
                    <p class="no-content">No Content</p>
                {/if}
            </section>
        {/if}
    {/if}
    <main
        class="main"
        style:display={$mode === "search" ? "none" : "initial"}
        on:pointerdown={handlePointerDown}
        on:pointerup={handlePointerUp}
    >
        <Content
            {view}
            count={view === "FOLDER"
                ? $folderStore?.files.length
                : $fileStore?.files.length}
        />
        {#if mask}
            <div class="mask"></div>
        {/if}
    </main>
    <button
        class="scroll btn s-prime"
        class:up={delta < 0}
        class:down={delta > 0}
        style:display={isScrolling ? "initial" : "none"}
        on:click={() => {
            delta > 0
                ? window.scrollTo({
                      top: document.body.scrollHeight,
                      behavior: "instant",
                  })
                : window.scrollTo({
                      top: 0,
                      behavior: "instant",
                  });
        }}>{@html scrollDownIcon}</button
    >
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
        padding: 1rem 0rem;
        position: sticky;
        top: 0;
        background-color: var(--primary-bg-color);
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

    .title-sub {
        color: var(--color-light-blue);
        color: #f00;
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

    .loading {
        position: absolute;
        top: 5rem;
        right: 1rem;
    }
    .two {
        display: none;
    }
    .search-wrapper {
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        width: 100%;
        color: var(--color-three);
        position: sticky;
        top: 5rem;
        z-index: 1;
        /* box-shadow: 0 0 5px 1px var(--color-file-border); */
        background-color: var(--primary-bg-color);
    }
    .global {
        padding: 1rem;
        border: 1px solid var(--color-file-border);
        border-top-left-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;
    }
    .global.active {
        color: #f00;
        /* background-color: var(--bg-color-three); */
    }

    .down {
        rotate: -90deg;
    }
    .up {
        rotate: 90deg;
    }
    .scroll {
        position: fixed;
        bottom: 5rem;
        right: 5rem;
        border-radius: 50%;
        /* box-shadow: 0 0 1px 1px var(--primary-color); */
        box-sizing: content-box;
        padding: 1rem;
    }
    .scroll :global(svg) {
        border-radius: 50%;
        box-shadow: 0 0 1px 1px var(--primary-color);
        background-color: var(--primary-bg-color);
    }
    #search {
        width: 100%;
        max-width: 30rem;
        padding: 1rem;
        display: block;
        outline: none;
        border: none;
        border-top-right-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        border-bottom: 2px solid var(--color-file-border);
        background-color: var(--bg-color-two);
    }
    #search:focus {
        background-color: var(--bg-color-three);
    }

    .list {
        display: flex;
        flex-flow: row wrap;
        align-items: flex-start;
        justify-content: center;
        gap: var(--content-gap);
        padding: 2rem 0rem;
    }

    .no-content {
        display: flex;
        flex-flow: column nowrap;
        gap: 0.5rem;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        color: #555;
        text-align: center;
        user-select: none;
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
            padding: 1rem 0.5rem;
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
        .search-wrapper {
            padding: 1rem;
            top: 3.5rem;
        }
        #search,
        .global {
            padding: 0.7rem;
            width: fit-content;
        }

        .folder-name {
            flex-shrink: 0;
            padding: 0.5rem;
        }

        .scroll {
            right: 2rem;
            bottom: 2rem;
        }
        .no-content {
            font-size: smaller;
        }

        .fetch-all {
            position: absolute;
            top: 5rem;
        }
    }
</style>
