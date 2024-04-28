<script lang="ts">
    import urlIcon from "$lib/assets/url.svg?raw";
    import { isValidUrl } from "$lib/scripts/utils";
    export let files: GoogleFile[];
</script>

<div class="peak">
    {#each files as file}
        <div data-id={file.id} class="card">
            <img
                src={file.thumbnailLink}
                alt=""
                height="150"
                width="200"
                data-id={file.id}
            />
            {#if file.description}
                <a
                    href={isValidUrl(file.description)}
                    class="img-link btn s-second"
                    referrerpolicy="no-referrer"
                    rel="external noopener noreferrer nofollow"
                    title={file.description}
                    target="_blank"
                    on:click|stopPropagation
                >
                    {@html urlIcon}
                </a>
            {/if}
        </div>
    {/each}
</div>

<style>
    .peak {
        display: flex;
        flex-flow: row wrap;
        justify-content: center;
        align-items: center;
        gap: 1rem;
        height: 45rem;
        overflow-y: scroll;
    }
    .card {
        position: relative;
    }
    .card:hover img {
        filter: brightness(0.5);
    }
    .card:hover .img-link {
        opacity: 1;
    }
    img {
        width: 15rem;
        height: 20rem;
        object-fit: contain;
        object-position: top;
        overflow: hidden;
        border-radius: 0.5rem;
    }

    .img-link {
        position: absolute;
        right: 0.5rem;
        display: inline-block;
        top: 0.5rem;
        opacity: 0;
    }

    .img-link:hover :global(svg) {
        fill: red;
    }
    .img-link :global(svg) {
        fill: var(--color-white-two);
    }
</style>
