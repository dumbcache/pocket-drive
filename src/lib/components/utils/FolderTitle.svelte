<script>
    import { activeParent } from "$lib/scripts/stores";
    import { getRoot } from "$lib/scripts/utils";
</script>

{#if $activeParent && $activeParent.name}
    {#if $activeParent?.id !== getRoot() && $activeParent?.parents}
        <a
            class="title-sub"
            title="go to parent"
            href={$activeParent?.parents[0]}>./</a
        >
    {/if}
    {$activeParent?.name}
{/if}

<style>
    .title-sub {
        color: var(--color-focus);
    }
</style>
