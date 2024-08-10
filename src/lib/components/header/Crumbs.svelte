<script>
    import { HOME_PATH, tempStore } from "$lib/scripts/stores.svelte";
    import { getRoot } from "$lib/scripts/utils";
    import homeIcon from "$lib/assets/home.svg?raw";
</script>

{#if tempStore.activeFolder?.name}
    <div class="crumbs">
        <a class="path" href={HOME_PATH}>
            <span class="icon s-second">
                {@html homeIcon}
            </span>
            <span>Home</span>
        </a>
        {#if tempStore.activeFolder?.id !== getRoot()}
            {#if tempStore.activeFolder.parents[0] !== getRoot()}
                <span>/</span>
                <button
                    class="title-sub path"
                    title="level up"
                    onclick={() => history.back()}>.....</button
                >
                <!-- <a
                    class="title-sub path"
                    title="level up"
                    href={tempStore.activeFolder.parents[0]}>...</a
                > -->
            {/if}

            <span>/</span>
            <span class="active">
                {tempStore.activeFolder.name}
            </span>
        {/if}
    </div>
{/if}

<style>
    .crumbs {
        display: flex;
        align-items: center;
        gap: 1rem;
        width: fit-content;
        /* font-size: 1.3rem; */
    }
    .path {
        display: flex;
        align-items: center;
    }
    .path:hover {
        color: var(--color-focus);
    }
    .path:hover :global(svg) {
        fill: var(--color-focus);
    }
    .active {
        white-space: nowrap;
        max-width: 30rem;
        overflow: hidden;
        text-overflow: ellipsis;
    }

    @media (max-width: 900px) {
        .active {
            max-width: 20rem;
        }
    }

    @media (max-width: 600px) {
        .crumbs {
            font-size: 1.3rem;
        }
        .active {
            max-width: 14rem;
        }
    }
</style>
