<script lang="ts">
    import { fileStore, tempStore } from "$lib/scripts/stores.svelte";
    import { onMount } from "svelte";
    import { SvelteSet } from "svelte/reactivity";

    let {
        expand,
        fileMap,
    }: { expand: boolean; fileMap: Map<string, DriveFile> } = $props();
    let navigation: HTMLElement;
    let observer: IntersectionObserver;
    let inspectionLog = new SvelteSet();

    function changeHandler(id: string) {
        let preview = document.querySelector(".preview");
        if (!preview) return;
        const ele = preview.querySelector(`[data-id="${id}"]`);
        ele?.scrollIntoView({
            behavior: "instant",
            block: "center",
            inline: "center",
        });
        const ele2 = navigation.querySelector(`[data-id="${id}"]`);
        ele2?.scrollIntoView({
            behavior: "instant",
            block: "center",
            inline: "center",
        });
    }

    function childInspection() {
        observer = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        entry.target.timeoutid = setTimeout(() => {
                            let { id } = entry.target.dataset;
                            if (inspectionLog.has(id)) return;

                            let preview = document.querySelector(".preview");
                            let li = preview?.querySelector(
                                `[data-id="${id}"]`
                            ) as HTMLImageElement;
                            if (!li.src.startsWith("blob:")) {
                                li.src = li.dataset.src as string;
                            }
                            inspectionLog.add(id);
                            observer.unobserve(entry.target);
                        }, 700);
                    } else {
                        clearTimeout(entry.target.timeoutid);
                    }
                });
            },
            { threshold: 0 }
        );
        fileStore.files.forEach((item) => {
            let id = item.id;
            if (id) {
                let li = navigation?.querySelector(`[data-id="${id}"]`);
                li && observer.observe(li);
            }
        });
    }

    onMount(() => {
        setTimeout(() => {
            let id = tempStore.activeFile.id;
            if (id) {
                const ele = navigation.querySelector(`[data-id="${id}"]`);
                ele?.scrollIntoView({
                    behavior: "instant",
                    block: "center",
                    inline: "center",
                });
            }
            childInspection();
        }, 0);
    });

    function thumbClick(e: MouseEvent) {
        let target = e.target as HTMLImageElement;
        if (target === navigation) return;
        target.localName !== "img" && (target = target.querySelector("img"));
        const { id } = target.dataset;
        if (!id) return;
        if (id === tempStore.activeFile.id) return;
        let file = fileMap.get(id);
        // let file = fileStore.files.find((file) => file.id === id);
        file && (tempStore.activeFile = file);
        changeHandler(id);
    }

    $effect(() => {
        const ele = navigation.querySelector(
            `[data-id="${tempStore.activeFile.id}"]`
        );
        ele?.scrollIntoView({
            behavior: "instant",
            block: "center",
            inline: "center",
        });
    });
</script>

<section
    class="one nav"
    style:display={expand ? "none" : "initial"}
    onwheel={(e) => e.stopPropagation()}
>
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <nav class="thumbs" onclick={thumbClick} bind:this={navigation}>
        {#each fileStore.files as file}
            <button
                class:active={file.id === tempStore.activeFile.id}
                data-id={file.id}
            >
                <img
                    src={inspectionLog.has(file.id) ? file.thumbnailLink : ""}
                    alt=""
                    class:no={!file.thumbnailLink}
                    height="150"
                    width="200"
                    data-id={file.id}
                />
            </button>
        {/each}
    </nav>
</section>

<style>
    .thumbs {
        align-items: center;
        gap: 2rem;
        display: flex;
        flex-flow: column;
        height: fit-content;
        /* justify-content: center; */
    }

    button {
        display: inline-flex;
        border-radius: 0.5rem;
    }

    img {
        height: auto;
        object-fit: cover;
        object-position: top;
        width: 12rem;
        max-height: 15rem;
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
    .active img,
    .active:hover img {
        filter: brightness(0.5);
    }

    .no {
        height: 10rem;
        background-color: var(--color-file-background);
    }

    @media (max-width: 600px) and (orientation: portrait) {
        .thumbs {
            height: 100%;
            flex-flow: row nowrap;
            width: 100%;
            overflow-x: scroll;
            gap: 1rem;
        }
        .active img,
        img {
            min-width: 4rem;
            max-height: 4rem;
            width: 4rem;
        }

        .no {
            width: 5rem;
        }
        .one::-webkit-scrollbar {
            display: none;
        }
        @media (max-width: 600px) and (orientation: landscape) {
            .one {
                min-width: 10rem;
            }
        }
    }
</style>
