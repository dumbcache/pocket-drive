<script lang="ts">
    import Spinner from "$lib/components/utils/Spinner.svelte";

    let { status } = $props();
</script>

{#if status === ""}
    <Spinner height="4rem" width="4rem" />
{:else if status === "completed"}
    <div class="end">END</div>
{/if}

<style>
    .end {
        font-size: 1rem;
        user-select: none;
        position: relative;
        padding: 0rem 5rem;
        color: #555;
    }
    .end::after,
    .end::before {
        position: absolute;
        top: 50%;
        content: " ";
        width: 5rem;
        max-width: 10rem;
        padding: 0rem 1rem;
        border-bottom: 1px solid #555;
    }
    .end::after {
        right: -1rem;
    }
    .end::before {
        left: -1rem;
    }
    @media (max-width: 600px) {
        .end {
            padding: 1rem 5rem;
        }
    }
</style>
