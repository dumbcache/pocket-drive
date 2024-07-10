<script lang="ts">
    import failIcon from "$lib/assets/failure.svg?raw";
    import successIcon from "$lib/assets/success.svg?raw";
    import { progressStore } from "$lib/scripts/stores";
    import Spinner from "$lib/components/utils/Spinner.svelte";

    let total = 0,
        success = 0,
        fail = 0;
    progressStore.subscribe((val) => {
        total = val.total;
        success = val.success;
        fail = val.fail;
        if (success + fail === total && total !== 0)
            setTimeout(() => {
                progressStore.update(() => ({ total: 0, success: 0, fail: 0 }));
            }, 5000);
    });
</script>

<div class="progress-bar" style:display={total ? "initial" : "none"}>
    <div class="items">
        <!-- <button class="close btn s-second">{@html closeButton}</button> -->
        {#if success + fail !== total}
            <span class="loading item">
                <Spinner width={"2rem"} height={"2rem"} borderWidth={"2px"} />
                {total}
            </span>
        {/if}
        <div class="success item">
            <span class="s-second">{@html successIcon}</span>{success}
        </div>
        <div class="fail item">
            <span class="s-second">{@html failIcon}</span>{fail}
        </div>
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
        border: 1px solid var(--color-outline);
        border-right: none;
        background-color: var(--bg-color);
        font-size: smaller;
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
