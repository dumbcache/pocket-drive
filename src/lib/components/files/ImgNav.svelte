<script lang="ts">
    import imgPlaceholder from "$lib/assets/imgPlaceholder.svg";
    import { activeImage } from "$lib/scripts/shared/stores";
    import { setActiveImage } from "$lib/scripts/shared/utils";
    import { onDestroy, onMount } from "svelte";

    export let files: FileResponse;
    let active: string | undefined = $activeImage.id;
    let container: HTMLElement;

    const unsubscribe = activeImage.subscribe((data) => {
        if (data) {
            active = data.id;
        }
    });
    onMount(() => {
        if (active) {
            let ele = container.querySelector(
                `[data-id="${active}"]`
            ) as HTMLElement;
            setTimeout(() => {
                ele.scrollIntoView({
                    behavior: "instant",
                    block: "center",
                    inline: "center",
                });
            });
        }
    });
    onDestroy(() => {
        unsubscribe();
    });

    function thumbClick(e: MouseEvent) {
        let target = e.target as HTMLImageElement;
        if (target === container) return;
        target.localName !== "img" && (target = target.querySelector("img"));
        const { id } = target.dataset;
        if (id) {
            setActiveImage(id, target.src);
            target.scrollIntoView({
                behavior: "smooth",
                block: "center",
                inline: "center",
            });
        }
    }
</script>

{#if files}
    <nav class="thumbs" on:click={thumbClick} on:keydown bind:this={container}>
        {#each files as file}
            <button class:active={file.id === active} data-id={file.id}>
                <img
                    src={file.thumbnailLink}
                    alt="thumbnail to link"
                    height="150"
                    width="200"
                    data-id={file.id}
                    on:error={(e) => (e.target.src = imgPlaceholder)}
                />
            </button>
        {/each}
    </nav>
{/if}

<style>
    .thumbs {
        align-items: center;
        gap: 1rem;
        display: flex;
        flex-flow: column;
    }

    button {
        display: inline-block;
        border-radius: 0.5rem;
    }

    img {
        height: auto;
        object-fit: contain;
        filter: brightness(0.5);
        width: 80%;
        border-radius: 0.5rem;
    }
    button:hover img {
        filter: brightness(0.8);
        cursor: pointer;
    }
    .active {
        border: 2px solid var(--color-focus);
        box-shadow: 0 0 5px 1px var(--color-white-light);
        /* margin: 2rem; */
    }
    .active img {
        filter: none;
        width: 100%;
    }

    @media (max-width: 600px) {
        .thumbs {
            height: 100%;
            flex-flow: row nowrap;
            width: initial;
        }

        img {
            min-width: 5rem;
            max-height: 5rem;
            width: 5rem;
        }
        .active img {
            min-width: 4rem;
            width: 4rem;
        }
    }
</style>
