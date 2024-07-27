<script lang="ts">
    import {
        fileStore,
        folderStore,
        getViewContext,
    } from "$lib/scripts/stores";

    export let count: number;

    let view = getViewContext();
    $: c =
        count ??
        ($view === "FOLDER"
            ? $folderStore?.files?.length
            : $fileStore?.files?.length);
</script>

{#if c}
    <p class="count" title="count">
        {c}
    </p>
{/if}

<style>
    .count {
        font-size: 1.3rem;
        min-width: 5rem;
        border: 1px solid var(--color-border);
        border-left: 5px solid var(--color-focus);
        background-color: var(--color-bg-one);
        padding: 0.2rem 0.5rem;
        box-sizing: border-box;
    }
    @media (max-width: 600px) {
        .count {
            min-width: 4rem;
            border-left-width: 2px;
        }
    }
</style>
