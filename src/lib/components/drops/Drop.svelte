<script>
    import DropItem from "$lib/components/drops/DropItem.svelte";
    import DropTools from "$lib/components/drops/DropTools.svelte";
    import doubleLeftIcon from "$lib/assets/arrowLeftDouble.svg?raw";
    import { fade } from "svelte/transition";
    import { onDestroy, onMount } from "svelte";
    import { navigating } from "$app/stores";
    import { states, tempStore } from "$lib/scripts/stores.svelte";

    let mini = $state(false);
    let expand = $state(false);
    const unsubscribe = navigating.subscribe((data) => {
        data && (mini = true);
    });

    function onMini() {
        mini = true;
    }

    function onExpand() {
        expand = !expand;
    }

    onDestroy(() => {
        states.autosave = false;
        unsubscribe();
    });
</script>

<button
    class="drop-mini btn s-prime"
    title="expand drop"
    style:display={mini === true ? "initial" : "none"}
    onclick={() => {
        mini = !mini;
    }}>{@html doubleLeftIcon}</button
>
<div
    class="drop"
    class:expand
    style:display={mini === true ? "none" : "initial"}
    transition:fade={{ duration: 200 }}
>
    <DropTools {onMini} {onExpand} />
    <div class="drop-items">
        {#each tempStore.dropItems as item}
            {#key item.id}
                <DropItem {item} />
            {/key}
        {/each}
    </div>
</div>

<style>
    .drop-mini {
        position: fixed;
        top: 15rem;
        right: 0;
        background-color: var(--color-focus);
        z-index: 1;
        border-top-left-radius: 1rem;
        border-bottom-left-radius: 1rem;
        outline: 1px solid var(--color-lite);
    }
    .drop-mini :global(svg) {
        fill: var(--color-bg);
    }
    .drop {
        position: sticky;
        top: 0;
        background: inherit;
        /* background-color: var(--color-bg-one); */
        border-left: 1px solid var(--color-lite);
        overflow-y: scroll;
        padding: 1rem;
        padding-top: 0rem;
        max-width: 30%;
        z-index: 1;
        min-width: 40%;
        height: 100vh;
    }

    .drop-items {
        width: 100%;
        display: flex;
        flex-flow: row wrap;
        align-self: start;
        align-items: start;
        justify-content: space-evenly;
        gap: 2rem 1rem;
    }
    .drop :global(input) {
        overflow: hidden;
        text-overflow: ellipsis;
        white-space: nowrap;
        flex-shrink: 2;
        width: 100%;
        border: none;
        outline: none;
        /* padding: 0.5rem; */
        font-size: 1.3rem;
        color: var(--color);
        background-color: var(--color-bg-one);
        /* padding-left: 0.5rem; */
    }

    .drop :global(input:disabled:hover),
    .drop :global(input:disabled) {
        background-color: var(--color-bg);
        cursor: not-allowed;
        border-bottom: none;
    }
    .drop :global(input:hover),
    .drop :global(input:focus) {
        filter: invert(0.1);
    }

    .expand {
        position: fixed;
        left: 0;
        right: 0;
        top: 0;
        bottom: 0;
        min-width: 100%;
        max-width: 100%;
        border-left: none;
    }

    @media (max-width: 800px) {
        .drop-mini,
        .drop {
            z-index: 2;
        }
    }
    @media (max-width: 600px) {
        .drop {
            position: fixed;
            left: 0;
            right: 0;
            top: 0;
            bottom: 0;
            min-width: 100%;
            max-width: 100%;
            border-left: none;
        }
        .drop-mini {
            /* top: 15rem; */
            /* bottom: 2rem; */
        }
        .drop-items {
            gap: 1rem;
        }
    }
</style>
