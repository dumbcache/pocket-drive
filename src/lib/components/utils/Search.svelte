<script lang="ts">
    import { folderStore, mode } from "$lib/scripts/stores";
    import { getToken, searchHandler } from "$lib/scripts/utils";
    import Folder from "$lib/components/folders/Folder.svelte";
    import { onDestroy, onMount } from "svelte";
    import Spinner from "$lib/components/utils/Spinner.svelte";

    let global = false;
    let searchElement: HTMLInputElement;
    let search = "";
    let searchFolders: Folder[] = [];
    let searchTimeout: number;
    let token = getToken();
    let loading = false;

    function handleSearch() {
        clearTimeout(searchTimeout);
        loading = true;
        searchTimeout = setTimeout(async () => {
            let val = search.trim();
            if (val === "") {
                // folders = [...$folderStore?.files];
                searchFolders = [];
                loading = false;
                return;
            }
            if (global) {
                let f = await searchHandler(token, val);
                if (val === search.trim()) searchFolders = f;
                loading = false;
                return;
            }
            searchFolders = $folderStore?.files.filter((folder) =>
                folder.name.toLowerCase().includes(val.toLowerCase())
            );
            loading = false;
        }, 500);
    }

    async function handleChange() {
        if (search.trim() === "") {
            searchFolders = [];
            return;
        }
    }

    const unsubscribeMode = mode.subscribe((data) => {
        if (data === "") {
            search = "";
            global = false;
            searchFolders = [];
        }
    });
    onMount(() => {
        setTimeout(() => {
            searchElement.focus();
        });
    });

    onDestroy(() => {
        unsubscribeMode();
    });
</script>

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
        placeholder="search folders"
        bind:this={searchElement}
        bind:value={search}
        on:input={handleSearch}
        on:change={handleChange}
    />
    {#if loading}
        <div class="loading" on:wheel|preventDefault>
            <Spinner width={"1.5rem"} height={"1.5rem"} borderWidth={"2px"} />
        </div>
    {/if}
</div>

<section class="folder-container">
    {#if searchFolders && searchFolders.length > 0}
        <ol class="list">
            {#each searchFolders as file (file.id)}
                <li data-id={file.id}>
                    <Folder {file} visible={true} />
                </li>
            {/each}
        </ol>
    {:else}
        <p class="no-content">No Content</p>
    {/if}
</section>

<style>
    .search-wrapper {
        position: relative;
        display: flex;
        align-items: center;
        justify-content: center;
        padding: 1rem;
        max-width: 40rem;
        margin: auto;
        color: var(--color-two);
        position: sticky;
        top: 5rem;
        z-index: 1;
        /* box-shadow: 0 0 5px 1px var(--color-border); */
        background-color: var(--color-bg);
    }
    .global {
        padding: 1rem;
        border: 1px solid var(--color-border);
        border-top-left-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;
    }
    .global.active {
        color: #f00;
        /* background-color: var(--color-bg-one); */
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
        border-bottom: 2px solid var(--color-border);
        background-color: var(--color-bg-two);
    }
    #search:focus {
        background-color: var(--color-bg-one);
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
    .loading {
        position: absolute;
        top: 50%;
        transform: translate(0, -50%);
        right: 7rem;
    }
    @media (max-width: 600px) {
        .search-wrapper {
            padding: 1rem;
            top: 3.5rem;
        }
        #search,
        .global {
            padding: 0.7rem;
            width: fit-content;
        }

        .no-content {
            font-size: smaller;
        }
    }
</style>
