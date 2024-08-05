<script>
    import { activeFolder } from "$lib/scripts/stores";
    import { getRoot } from "$lib/scripts/utils";
</script>

{#if $activeFolder && $activeFolder.name}
    {#if $activeFolder?.id !== getRoot() && $activeFolder?.parents}
        <a
            class="title-sub"
            title="go to parent"
            href={$activeFolder?.parents[0]}>./</a
        >
    {/if}
    {$activeFolder?.name}
{/if}

<style>
    .title-sub {
        color: var(--color-focus);
    }
</style>
