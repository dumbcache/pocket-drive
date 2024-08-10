<script lang="ts">
    import {
        DIR_MIME_TYPE,
        IMG_MIME_TYPE,
        searchHandler,
    } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";
    import Spinner from "$lib/components/utils/Spinner.svelte";
    import ActionForm from "$lib/components/folders/ActionForm.svelte";
    import {
        fileSearchStore,
        fileStore,
        folderSearchStore,
        folderStore,
        states,
        tempStore,
    } from "$lib/scripts/stores.svelte";
    import clearIcon from "$lib/assets/close.svg?raw";
    import { onDestroy, onMount } from "svelte";
    import Select from "$lib/components/folders/Select.svelte";
    import Content from "$lib/components/search/Content.svelte";

    let global = false;
    let searchElement: HTMLInputElement;
    let search = "";
    let token = getToken();
    let loading = false;
    let abortController: AbortController;
    let searchTimeout: number;

    function handleSearch() {
        clearTimeout(searchTimeout);
        loading = true;
        if (abortController) {
            abortController.abort();
        }

        abortController = new AbortController();
        const { signal } = abortController;
        searchTimeout = setTimeout(async () => {
            let val = search.trim();
            folderSearchStore.set({});
            fileSearchStore.set({});
            if (val === "") {
                loading = false;
                return;
            }
            if (global) {
                try {
                    await Promise.all([
                        new Promise((res) => {
                            searchHandler(
                                { mimeType: DIR_MIME_TYPE, search: val },
                                token,
                                signal
                            ).then((folders) => {
                                res();
                                if (val === search.trim()) {
                                    folderSearchStore.set(folders);
                                }
                            });
                        }),
                        new Promise((res) => {
                            searchHandler(
                                { mimeType: IMG_MIME_TYPE, search: val },
                                token,
                                signal
                            ).then((files) => {
                                res();
                                if (val === search.trim()) {
                                    fileSearchStore.set(files);
                                }
                            });
                        }),
                    ]);
                } catch (error) {
                } finally {
                    loading = false;
                }
                return;
            }
            folderSearchStore.files = folderStore.files.filter((folder) =>
                folder.name.toLowerCase().includes(val.toLowerCase())
            );
            fileSearchStore.files = fileStore.files.filter((folder) =>
                folder.name.toLowerCase().includes(val.toLowerCase())
            );
            loading = false;
        }, 500);
    }

    async function handleChange() {
        if (search.trim() === "") {
            searchElement.focus();
            folderSearchStore.set({});
            fileSearchStore.set({});
            return;
        }
    }

    onMount(() => {
        setTimeout(() => {
            searchElement.focus();
        });
    });
    onDestroy(() => {
        folderSearchStore.set({});
        fileSearchStore.set({});
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
    <Content {search} />
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
        top: 1rem;
        z-index: 1;
        /* background-color: var(--color-bg); */
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
            top: 8rem;
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
