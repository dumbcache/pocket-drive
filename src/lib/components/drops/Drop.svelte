<script>
    import { autosave, dropItems } from "$lib/scripts/stores";
    import DropItem from "$lib/components/drops/DropItem.svelte";
    import DropTools from "$lib/components/drops/DropTools.svelte";
    import doubleLeftIcon from "$lib/assets/arrowLeftDouble.svg?raw";
    import { fade } from "svelte/transition";
    import { onDestroy } from "svelte";
    import { navigating } from "$app/stores";

    let mini = false;
    let expand = false;
    const unsubscribe = navigating.subscribe((data) => {
        data && (mini = true);
    });
    onDestroy(() => {
        $autosave = false;
        unsubscribe();
    });
</script>

{#if $dropItems.length !== 0}
    <!-- {#if mini} -->
    <button
        class="drop-mini btn s-prime"
        style:display={mini === true ? "initial" : "none"}
        on:click={() => {
            mini = !mini;
        }}>{@html doubleLeftIcon}</button
    >
    <!-- {:else} -->
    <div
        class="drop"
        class:expand
        style:display={mini === true ? "none" : "initial"}
        transition:fade={{ duration: 200 }}
    >
        <DropTools
            on:mini={() => (mini = true)}
            on:expand={() => (expand = !expand)}
        />
        <div class="drop-items">
            {#each $dropItems as item}
                {#key item.id}
                    <DropItem {item} />
                {/key}
            {/each}
        </div>
    </div>
    <!-- {/if} -->
{/if}

<style>
    .drop-mini {
        position: fixed;
        top: 7rem;
        right: 0;
        background-color: #043;
        z-index: 1;
        border-top-left-radius: 1rem;
        border-bottom-left-radius: 1rem;
        outline: 1px solid var(--color-border);
    }
    .drop-mini :global(svg) {
        fill: var(--color-white);
    }
    .drop {
        position: sticky;
        top: 0;
        background-color: inherit;
        border-left: 1px solid var(--color);
        overflow-y: scroll;
        padding: 1rem;
        padding-top: 0rem;
        max-width: 30%;
        z-index: 1;
        min-width: 40%;
        height: 100vh;
        backdrop-filter: blur(1rem);
        -webkit-backdrop-filter: blur(1rem);
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
        border-bottom-left-radius: 0.5rem;
        border-bottom-right-radius: 0.5rem;
        padding: 0.5rem;
        font-size: 1.6rem;
        color: var(--color);
        background-color: var(--color-bg-four);
        border-bottom: 2px solid var(--color-black);
        padding-left: 0.5rem;
    }

    .drop :global(input:disabled:hover),
    .drop :global(input:disabled) {
        background-color: var(--color-bg);
        color: #666;
        cursor: not-allowed;
    }
    .drop :global(input:hover) {
        background-color: var(--color-bg-five);
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
            top: unset;
            bottom: 2rem;
        }
        .drop-items {
            gap: 1rem;
        }
    }
</style>
