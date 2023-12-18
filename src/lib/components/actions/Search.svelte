<script lang="ts">
    import { searchHandler } from "$lib/scripts/gdrive/utils";
    import { activeDirs, globalSearch, mode } from "$lib/scripts/stores";
    import { searchItems } from "$lib/scripts/shared/stores";
    import { onMount, onDestroy } from "svelte";

    let search: string;
    let selected: Boolean;
    $: selected = $globalSearch;
    let input: HTMLInputElement;

    const token = window.localStorage.getItem("token")!;

    function updateSearchItems() {
        let temp = search.trim();
        if (!selected) {
            $searchItems = $activeDirs?.filter((dir) => {
                return dir.name.toLowerCase().includes(temp.toLowerCase());
            });
            return;
        }
        if (temp !== "") searchHandler(token, temp);
    }
    onMount(() => {
        input.focus();
        setTimeout(() => {
            search = "";
            $searchItems = $activeDirs;
        }, 0);
    });
    onDestroy(() => {
        $searchItems = undefined;
    });
</script>

<div class="search">
    <button
        class="global {selected && 'selected'}"
        on:click={() => {
            selected = !selected;
            input.focus();
        }}>/r</button
    >
    <input
        type="search"
        placeholder="Search"
        bind:value={search}
        bind:this={input}
        on:input|stopPropagation={updateSearchItems}
        on:keydown|stopPropagation
    />
</div>

<style>
    .search {
        display: flex;
        align-items: center;
    }
    button {
        cursor: pointer;
        filter: none;
        padding: 1rem;
        border-bottom-left-radius: 0.5rem;
        border-top-left-radius: 0.5rem;
        border: 1px solid var(--primary-color);
        border: 1px solid var(--cover-border-color);
        /* border-right: none; */
        border-bottom: 2px solid var(--color-black);
        height: fit-content;
        width: fit-content;
        background-color: var(--input-background);
        user-select: none;
    }
    button:hover {
        background-color: var(--theme-button-hover-outline);
    }
    .selected {
        color: red;
    }
    input {
        width: 100%;
        border: none;
        outline: none;
        border-radius: 0.5rem;
        border-bottom-left-radius: 0;
        border-top-left-radius: 0;
        padding: 1rem;
        font-size: 1.6rem;
        color: var(--primary-color);
        background-color: var(--input-background);
        border-bottom: 2px solid var(--color-black);
        padding-left: 0.5rem;
    }

    input:hover {
        background-color: var(--theme-button-hover-outline);
    }

    @media (max-width: 600px) {
        input,
        button {
            padding: 0.5rem;
            font-size: 1.5rem;
        }
    }
</style>
