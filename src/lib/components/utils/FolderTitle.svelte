<script>
    import { tempStore } from "$lib/scripts/stores.svelte";
    import { getRoot } from "$lib/scripts/utils";
    import homeIcon from "$lib/assets/home.svg?raw";
</script>

{#if tempStore.activeFolder?.name}
    <div class="title">
        {#if tempStore.activeFolder?.id !== getRoot()}
            <a
                class="title-sub"
                title="go to parent"
                href={tempStore.activeFolder.parents[0]}>./</a
            >
        {:else}
            <span class="icon s-second">
                {@html homeIcon}
            </span>
        {/if}
        <span>
            {tempStore.activeFolder.name}
        </span>
    </div>
{/if}

<style>
    .title {
        display: flex;
        align-items: center;
        /* font-size: 1.3rem; */
    }
    .title-sub {
        color: var(--color-focus);
    }
</style>
