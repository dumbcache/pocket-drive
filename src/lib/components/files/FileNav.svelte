<script lang="ts">
    import { activeImage } from "$lib/scripts/stores";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";

    export let files: File[];
    export let preview: HTMLElement;
    let active: string;
    let navigation: HTMLElement;
    const dispatch = createEventDispatcher();
    let observer: IntersectionObserver;
    let inspectionLog = {};

    const unsubscribe = activeImage.subscribe((data) => {
        if (data && data.id != active) {
            active = data.id;
            if (navigation) {
                let ele = navigation.querySelector(
                    `[data-id="${data.id}"]`
                ) as HTMLElement;
                setTimeout(() => {
                    ele?.scrollIntoView({
                        behavior: "smooth",
                        block: "center",
                        inline: "center",
                    });
                });
            }
        }
    });

    function childInspection(items: FileResponse | undefined) {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.timeoutid = setTimeout(() => {
                            let { id } = entry.target.dataset;
                            if (!inspectionLog[id]) {
                                // viewCache.update((val) => ({
                                //     ...val,
                                //     [id]: true,
                                // }));
                                let li = preview?.querySelector(
                                    `[data-id="${id}"]`
                                ) as HTMLImageElement;
                                if (!li.src.startsWith("blob://")) {
                                    li.src = li.dataset.src;
                                }
                                inspectionLog[id] = true;
                            }
                            observer.unobserve(entry.target);
                        }, 700);
                    } else {
                        clearTimeout(entry.target.timeoutid);
                    }
                });
            },
            { threshold: 0 }
        );
        items?.forEach((item) => {
            let id = item.id;
            if (id) {
                let li = navigation?.querySelector(`[data-id="${id}"]`);
                li && observer.observe(li);
            }
        });
    }

    onMount(() => {
        setTimeout(() => {
            if ($activeImage) {
                const ele = navigation.querySelector(
                    `[data-id="${$activeImage.id}"]`
                );
                ele?.scrollIntoView({
                    behavior: "instant",
                    block: "center",
                    inline: "center",
                });
            }
        }, 0.1);
        setTimeout(() => {
            childInspection(files);
        }, 1000);
    });

    onDestroy(() => {
        unsubscribe();
    });

    function thumbClick(e: MouseEvent) {
        let target = e.target as HTMLImageElement;
        if (target === navigation) return;
        target.localName !== "img" && (target = target.querySelector("img"));
        const { id } = target.dataset;
        const [file] = files.filter((file) => file.id === id);
        activeImage.set(file);
        dispatch("change", { id });
    }
</script>

{#if files}
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <nav class="thumbs" on:click={thumbClick} on:keydown bind:this={navigation}>
        {#each files as file}
            <button
                class:active={file.id === $activeImage?.id}
                data-id={file.id}
            >
                <img
                    src={inspectionLog[file.id] ? file.thumbnailLink : ""}
                    alt=""
                    class:no={!file.thumbnailLink}
                    height="150"
                    width="200"
                    data-id={file.id}
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
    }
    .active img {
        filter: none;
        width: 100%;
    }
    .no {
        height: 10rem;
        background-color: var(--color-file-background);
    }

    @media (max-width: 600px) and (orientation: portrait) {
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
        .no {
            width: 5rem;
        }
    }
</style>
