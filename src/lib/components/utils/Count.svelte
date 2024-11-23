<script lang="ts">
    let { count }: { count: number } = $props();
</script>

{#if count >= 0}
    <p class="count" title="count">
        {count}
    </p>
{/if}

<style>
    .count {
        font-size: 1.3rem;
        min-width: 5rem;
        border: 1px solid var(--color-lite);
        border-left: 5px solid var(--color-focus);
        background-color: var(--color-bg-one);
        padding: 0.5rem 0.5rem;
        box-sizing: border-box;
    }
    @media (max-width: 600px) {
        .count {
            min-width: 4rem;
            border-left-width: 2px;
            padding: 0.2rem 0.5rem;
        }
    }
</style>
