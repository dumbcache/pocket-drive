<script lang="ts">
    import imgPlaceholder from "$lib/assets/imgPlaceholder.svg";

    export let imgs: GoogleFile[];
    console.log(imgs);
</script>

{#if imgs}
    {#each imgs as img}
        <img
            src={img.thumbnailLink}
            alt="thumbnail to link"
            class="active"
            height="150"
            width="200"
            data-id={img.id}
            on:error={(e) => (e.target.src = imgPlaceholder)}
        />
    {/each}
{/if}

<style>
    img {
        max-width: 100%;
        max-height: 15rem;
        object-fit: contain;
        filter: brightness(0.5);
    }
    .active {
        filter: none;
    }

    @media (max-width: 600px) {
    }
</style>
