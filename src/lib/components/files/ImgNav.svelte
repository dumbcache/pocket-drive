<script lang="ts">
    import imgPlaceholder from "$lib/assets/imgPlaceholder.svg";
    import { activeImage } from "$lib/scripts/shared/stores";
    import { onMount } from "svelte";

    export let files: FileResponse;
    let active: string | undefined;
    let container: HTMLElement;

    onMount(() => {
        return activeImage.subscribe((data) => {
            console.log(data);
            if (data) {
                active = data;
                let ele = container.querySelector(
                    `[data-id="${data}"]`
                ) as HTMLElement;
                setTimeout(() => {
                    ele.scrollIntoView({
                        behavior: "instant",
                        block: "center",
                        inline: "center",
                    });
                }, 500);
            }
        });
    });

    function thumbClick(e: KeyboardEvent) {
        if (e?.key === "Tab") return;
        const target = e.target as HTMLElement;
        const { id } = target.dataset;
        active = id;
        target.scrollIntoView({
            behavior: "smooth",
            block: "center",
            inline: "center",
        });
    }
</script>

{#if files}
    <nav
        class="thumbs"
        on:click={thumbClick}
        on:keydown={thumbClick}
        bind:this={container}
    >
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
        padding: 1rem;
        align-items: center;
        gap: 1rem;
        display: flex;
        flex-flow: column;
    }
    .thumbs ::-webkit-scrollbar {
        display: none;
    }
    button {
        display: block;
        /* max-height: 15rem; */
        /* overflow: hidden; */
        border-radius: 0.5rem;
        /* border: 1px solid var(--color-file-border); */
        /* margin-bottom: 2rem; */
    }

    img {
        height: auto;
        filter: brightness(0.5);
        width: 80%;
        transition: max-width 2s;
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
    }
</style>
