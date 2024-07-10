<script lang="ts">
    export let count: Number = 0;
</script>

<p class="count" title="count">
    {count}
</p>

<style>
    .count {
        font-size: 1.3rem;
        min-width: 5rem;
        border: 1px solid var(--color-border);
        border-left: 5px solid var(--color-light-blue);
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
