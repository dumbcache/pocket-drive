<script>
    import { tempStore } from "$lib/scripts/stores.svelte";
    import { getRoot } from "$lib/scripts/utils";
</script>

{#if tempStore.activeFolder?.name}
    {#if tempStore.activeFolder?.id !== getRoot()}
        <a
            class="title-sub"
            title="go to parent"
            href={tempStore.activeFolder.parents[0]}>./</a
        >
    {/if}
    {tempStore.activeFolder.name}
{/if}

<style>
    .title-sub {
        color: var(--color-focus);
    }
</style>
