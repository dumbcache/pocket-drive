<script lang="ts">
    import ImgCard from "$lib/components/imgs/ImgCard.svelte";
    import { activeImgs } from "$lib/scripts/stores";

    export let imgs: GoogleFile[];
</script>

<div class="imgs">
    {#if imgs}
        {#each imgs as img}
            <ImgCard {img} />
        {/each}
    {/if}
</div>

<style>
    .imgs {
        display: flex;
        flex-flow: row wrap;
        gap: var(--content-gap);
        padding: var(--content-padding);
        justify-content: center;
    }
    @media (max-width: 600px) {
    }
</style>
