<script lang="ts">
    import { searchHandler } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";
    import Folder from "$lib/components/folders/Folder.svelte";
    import Spinner from "$lib/components/utils/Spinner.svelte";
    import FolderSelect from "$lib/components/folders/FolderSelect.svelte";
    import ActionForm from "$lib/components/folders/ActionForm.svelte";
    import { folderStore, states, tempStore } from "$lib/scripts/stores.svelte";
    import clearIcon from "$lib/assets/close.svg?raw";
    import { onMount } from "svelte";
    import Select from "$lib/components/folders/Select.svelte";

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
            searchFolders = folderStore.files.filter((folder) =>
                folder.name.toLowerCase().includes(val.toLowerCase())
            );
            loading = false;
        }, 500);
    }

    async function handleChange() {
        if (search.trim() === "") {
            searchFolders = [];
            searchElement.focus();
            return;
        }
    }

    // const unsubscribeMode = mode.subscribe((data) => {
    //     if (data === "") {
    //         search = "";
    //         global = false;
    //         searchFolders = [];
    //     }
    // });
    onMount(() => {
        setTimeout(() => {
            searchElement.focus();
        });
    });
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<div class="search-wrapper" role="form" onkeydown={(e) => e.stopPropagation()}>
    <button
        title="global"
        role="switch"
        aria-checked="false"
        class="global"
        class:active={global}
        onclick={() => {
            global = !global;
            searchElement.focus();
            handleSearch();
        }}>G</button
    >
    <!-- svelte-ignore a11y-autofocus -->
    <input
        type="input"
        name="search"
        id="search"
        title="search"
        autocomplete="off"
        placeholder="search folders"
        bind:this={searchElement}
        bind:value={search}
        oninput={handleSearch}
        onchange={handleChange}
    />
    {#if loading}
        <div class="loading">
            <Spinner width={"1.5rem"} height={"1.5rem"} borderWidth={"2px"} />
        </div>
    {:else if search.length > 0}
        <button
            class="clear btn s-second"
            onclick={() => {
                search = "";
                handleChange();
            }}
        >
            {@html clearIcon}
        </button>
    {/if}
</div>

<section class="search-results">
    {#if searchFolders && searchFolders.length > 0}
        <ol class="list">
            {#each searchFolders as file (file.id)}
                <li data-id={file.id}>
                    <Folder {file} visible={true} />
                </li>
            {/each}
        </ol>
    {:else}
        <p class="no-content">No Results</p>
    {/if}
</section>

{#if tempStore.folderAction.type && states.mode === "SEARCH"}
    {#if tempStore.folderAction.type === "MOVE"}
        <Select />
    {:else}
        <ActionForm />
    {/if}
{/if}

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
        background-color: var(--color-bg);
        /* top: 10rem; */
        /* z-index: 2; */
        /* box-shadow: 0 0 5px 1px var(--color-border); */
    }
    .global {
        padding: 1.5rem;
        border: 1px solid var(--color-border);
        border-radius: 2.5rem;
        position: absolute;
        left: 1rem;
        width: 5rem;
    }
    .global.active {
        color: var(--color-bg);
        background-color: var(--color-focus);
        /* background-color: var(--color-bg-one); */
    }
    #search {
        width: 100%;
        padding: 1.5rem 6rem;
        display: block;
        outline: none;
        border: none;
        border-radius: none;
        border-top-right-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        border-bottom: 2px solid var(--color-border);
        background-color: var(--color-bg-one);
        border-radius: 2.5rem;
    }

    .list {
        display: flex;
        flex-flow: row wrap;
        align-items: flex-start;
        justify-content: center;
        padding: var(--content-padding);
        padding-top: var(--vertical-padding);
        gap: var(--content-gap);
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
        /* user-select: none; */
    }
    .loading,
    .clear {
        position: absolute;
        top: 50%;
        transform: translate(0, -50%);
        right: 3rem;
        background: none;
    }
    @media (max-width: 600px) {
        .search-wrapper {
            padding: 1rem;
            top: 3.5rem;
        }
        #search {
            padding: 1.3rem 5rem;
        }
        .global {
            padding: 1.3rem;
            width: 4.6rem;
        }

        .no-content {
            font-size: smaller;
        }

        .loading,
        .clear {
            right: 3rem;
        }
    }
</style>
