<script lang="ts">
    import failIcon from "$lib/assets/failure.svg?raw";
    import successIcon from "$lib/assets/success.svg?raw";
    import Spinner from "$lib/components/utils/Spinner.svelte";
    import { progressStore } from "$lib/scripts/stores.svelte";

    $effect(() => {
        if (
            progressStore.success + progressStore.fail ===
                progressStore.total &&
            progressStore.total !== 0
        ) {
            setTimeout(() => {
                progressStore.set(0, 0, 0);
            }, 5000);
        }
    });
</script>

<div class="progress-bar">
    <div class="items">
        <!-- <button class="close btn s-second">{@html closeButton}</button> -->
        {#if progressStore.success + progressStore.fail !== progressStore.total}
            <span class="loading item">
                <Spinner width={"2rem"} height={"2rem"} borderWidth={"2px"} />
                {progressStore.total}
            </span>
        {/if}
        {#if progressStore.success > 0}
            <div class="success item">
                <span class="s-second">{@html successIcon}</span
                >{progressStore.success}
            </div>
        {/if}
        {#if progressStore.fail > 0}
            <div class="fail item">
                <span class="s-second">{@html failIcon}</span
                >{progressStore.fail}
            </div>
        {/if}
    </div>
</div>

<style>
    .progress-bar {
        position: fixed;
        top: 7rem;
        right: 0rem;
        z-index: 10;
        padding: 0.5rem;
        border-top-left-radius: 0.5rem;
        border-bottom-left-radius: 0.5rem;
        border: 1px solid var(--color-border);
        border-right: none;
        background-color: var(--color-bg);
        font-size: smaller;
        box-shadow: 0 0 1px 1px var(--color-white-light);
        background-color: var(--color-bg-one);
    }

    .items {
        display: flex;
        flex-flow: row nowrap;
        gap: 0.5rem;
        align-items: center;
    }

    .item {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: 0.5rem;
    }
    span {
        display: flex;
        align-items: center;
    }
    span :global(svg) {
        filter: none;
    }

    @media (max-width: 600px) {
        .progress-bar {
            top: 14rem;
        }
    }
</style>
