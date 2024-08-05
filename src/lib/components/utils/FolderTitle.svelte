<script>
    import { temp } from "$lib/scripts/state.svelte";
    import { getRoot } from "$lib/scripts/utils";
</script>

{#if temp.activeFolder?.name}
    {#if temp.activeFolder?.id !== getRoot()}
        <a
            class="title-sub"
            title="go to parent"
            href={temp.activeFolder.parents[0]}>./</a
        >
    {/if}
    {temp.activeFolder.name}
{/if}

<style>
    .title-sub {
        color: var(--color-focus);
    }
</style>
