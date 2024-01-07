<script lang="ts">
    import { onDestroy } from "svelte";
    import { navigating, page } from "$app/stores";
    import {
        activeParent,
        activeView,
        fileStore,
        folderStore,
        mode,
    } from "$lib/scripts/shared/stores";
    import Content from "$lib/components/Content.svelte";
    import beforeNavigate from "$lib/assets/beforeNavigate.svg?raw";
    import Tools from "$lib/components/Tools.svelte";
    import Count from "$lib/components/actions/Count.svelte";

    let view = $activeView;
    let global = false;
    let search = "";
    const unsubscribeNavigation = navigating.subscribe(
        (val) => val || (view = "FOLDER")
    );
    const unsubscribeView = activeView.subscribe((data) => (view = data));
    onDestroy(() => {
        unsubscribeView();
        unsubscribeNavigation();
    });
</script>

<section class="wrapper" style:display="">
    <nav class="nav">
        {#if $page.params?.id !== "r"}
            <button
                class="back-button btn s-prime"
                on:click={() => {
                    history.back();
                    $activeView = "FOLDER";
                }}
            >
                {@html beforeNavigate}
            </button>
        {/if}

        <div class="tool-wrapper">
            <Tools />
        </div>

        <h2 class="folder-name one" title={$activeParent.name}>
            {$activeParent.name}
        </h2>

        <Count
            count={view === "FOLDER"
                ? $folderStore?.files.length
                : $fileStore?.files.length}
        />
    </nav>

    <h2 class="folder-name two" title={$activeParent.name}>
        {$activeParent.name}
    </h2>
    {#if $mode === "search" && view === "FOLDER"}
        <div class="search-wrapper" on:keydown|stopPropagation>
            <button
                title="global"
                role="switch"
                aria-checked="false"
                class="global"
                class:active={global}
                on:click={() => (global = !global)}>/R</button
            >
            <input
                type="search"
                name="search"
                id="search"
                autocomplete="off"
                autofocus
                placeholder="search"
                bind:value={search}
            />
        </div>
    {/if}
    <Content
        {view}
        count={view === "FOLDER"
            ? $folderStore?.files.length
            : $fileStore?.files.length}
    />
</section>

<style>
    .wrapper {
        width: 100%;
        padding: 0rem;
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
        background-color: var(--primary-bg-color);
        z-index: 1;
        gap: 5rem;
    }
    .back-button {
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
        /* box-shadow: 0 0 5px 1px var(--color-file-border); */
        background-color: var(--bg-color-two);
    }
    #search:focus {
        background-color: var(--bg-color-three);
    }

    @media (max-width: 600px) {
        .wrapper {
            padding: 0rem 0.5rem;
        }
        .tool-wrapper {
            display: initial;
        }
        .nav {
            padding: 1rem 0.5rem 1rem 0.5rem;
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
        .back-button {
            margin-left: 0rem;
        }
        .search-wrapper {
            padding: 1rem;
        }
        #search,
        .global {
            padding: 0.7rem;
        }
    }
</style>
