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
            <div class="loading item" on:wheel|preventDefault>
                <Spinner
                    width={"1.5rem"}
                    height={"1.5rem"}
                    borderWidth={"2px"}
                />
                <span class="total item">{total}</span>
            </div>
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
        background-color: var(--primary-bg-color);
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
    }
    span {
        display: flex;
        align-items: center;
        padding: 0.3rem;
    }

    @media (max-width: 600px) {
        .progress-bar {
            top: unset;
            bottom: 7rem;
        }
    }
</style>
