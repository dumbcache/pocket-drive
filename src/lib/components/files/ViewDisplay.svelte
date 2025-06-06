<script lang="ts">
    import {
        viewStore,
        tempStore,
        imageCache,
        imageFetchLog,
    } from "$lib/scripts/stores.svelte";
    import Spinner from "$lib/components/utils/Spinner.svelte";
    import {
        disableScrolling,
        enableScorlling,
        fetchImgPreview,
    } from "$lib/scripts/utils";
    import { onDestroy, onMount } from "svelte";

    let {
        zoom,
        fileMap,
        previewElements,
        toggleHidden,
        toggleExpand,
    }: {
        zoom: boolean;
        fileMap: Map<string, DriveFile>;
        previewElements: Map<string, HTMLElement>;
        toggleHidden: MouseEventHandler<HTMLButtonElement>;
        toggleExpand: MouseEventHandler<HTMLButtonElement>;
    } = $props();
    let preview: HTMLElement;
    let previewObserver: IntersectionObserver;
    let lastTap = 0;

    function handleKeyDown(e: KeyboardEvent) {
        e.preventDefault();
        e.stopPropagation();
        const target = e.target as HTMLImageElement;
        switch (e.key) {
            case "ArrowRight":
            case "ArrowDown":
                preview.scrollBy({
                    left: target.offsetWidth,
                    behavior: "instant",
                });
                return;
            case "ArrowLeft":
            case "ArrowUp":
                preview.scrollBy({
                    left: -target.offsetWidth,
                    behavior: "instant",
                });
                return;
        }
    }

    function handleWheel(e: WheelEvent) {
        if (zoom) return;
        e.stopPropagation();
        e.preventDefault();
        const target = e.target as HTMLImageElement;
        e.deltaY > 0
            ? preview.scrollBy({ left: target.offsetWidth, behavior: "smooth" })
            : preview.scrollBy({
                  left: -target.offsetWidth,
                  behavior: "smooth",
              });
    }

    function isTouchDevice() {
        return window.matchMedia("(pointer: coarse)").matches;
    }

    function handleClick(e: MouseEvent) {
        e.stopPropagation();
        if (isTouchDevice()) {
            const currentTime = new Date().getTime();
            const tapLength = currentTime - lastTap;
            if (tapLength < 300 && tapLength > 0) {
                toggleExpand();
            } else {
                toggleHidden();
            }
            lastTap = currentTime;
            return;
        }
        if (zoom) return;
        if (e.button != 0) return;
        const target = e.target as HTMLImageElement;
        if (target) {
            if (target.localName === "video") return;
            const half = target.offsetWidth / 2;
            const clickx = e.clientX - target.getBoundingClientRect().left;
            clickx > half
                ? preview.scrollBy({
                      left: target.offsetWidth,
                      behavior: "instant",
                  })
                : preview.scrollBy({
                      left: -target.offsetWidth,
                      behavior: "instant",
                  });
        }
    }

    function previewInspection() {
        previewObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach(async (entry) => {
                    if (entry.isIntersecting) {
                        let target = entry.target as HTMLImageElement;
                        let { id, src } = target.dataset;
                        if (!id) return;
                        if (!target.src && src) target.src = src;

                        if (tempStore.activeFile.id !== id) {
                            let active = fileMap.get(id);
                            if (active) tempStore.activeFile = active;
                        }

                        tempStore.activeFile.loading = false;
                        if (target.src.startsWith("blob:")) {
                            tempStore.activeFile.download = target.src;
                        } else {
                            if (imageCache.has(id)) {
                                target.src = imageCache.get(id);
                            } else {
                                if (imageFetchLog.has(id)) return;
                                tempStore.activeFile.loading = true;
                                fetchImgPreview(id);
                                imageFetchLog.add(id);
                            }
                        }
                    } else {
                        let target = entry.target as HTMLVideoElement;
                        if (target.localName !== "video") return;
                        target.pause();
                    }
                });
            },
            { root: preview, threshold: 0.1 }
        );
        viewStore.files?.forEach((item) => {
            let id = item.id;
            let li = preview?.querySelector(`[data-id="${id}"]`);
            if (li) {
                previewObserver.observe(li);
                previewElements.set(id, li);
            }
        });
    }

    onMount(() => {
        disableScrolling();
        setTimeout(() => {
            previewInspection();
            if (tempStore.activeFile) {
                const ele = preview.querySelector(
                    `[data-id="${tempStore.activeFile.id}"]`
                );
                ele?.scrollIntoView({
                    behavior: "instant",
                    block: "center",
                    inline: "center",
                });
            }
        }, 0);
    });

    onDestroy(() => {
        enableScorlling();
        imageCache.clear();
    });
</script>

<!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
<section
    class="two preview"
    role="dialog"
    onscroll={(e) => e.preventDefault()}
    onwheel={handleWheel}
    onclick={handleClick}
    onkeydown={handleKeyDown}
    bind:this={preview}
>
    {#each viewStore.files as file (file.id)}
        <div class="file">
            {#if file.mimeType.match("image/")}
                <img
                    onwheel={(e) => e.stopPropagation()}
                    class:zoom
                    class="img"
                    src=""
                    alt=""
                    data-id={file.id}
                    data-src={file.thumbnailLink}
                />
            {:else}
                <video
                    onwheel={(e) => e.preventDefault()}
                    onkeydown={(e) => e.stopPropagation()}
                    class="video"
                    data-id={file.id}
                    data-src={file.thumbnailLink}
                    src=""
                    poster={file.thumbnailLink}
                    muted
                    controls
                    loop
                    playsinline
                ></video>
            {/if}
        </div>
    {/each}
</section>

{#if tempStore.activeFile.loading}
    <div class="spinner">
        <Spinner borderWidth="2px" width="1rem" height="1rem" />
    </div>
{/if}

<style>
    .two::-webkit-scrollbar,
    .file::-webkit-scrollbar {
        display: none;
    }

    .file {
        width: 100%;
        flex: none;
        overflow: auto;
        scroll-snap-align: center;
    }

    .img,
    .video {
        display: block;
        width: auto;
        height: 100%;
        margin: auto;
        object-fit: contain;
        object-position: center;
    }

    .zoom {
        width: 100vw;
        height: auto;
        min-height: 100%;
    }

    .spinner {
        position: absolute;
        top: 28rem;
        right: 3rem;
        /* display: none; */
    }

    @media (max-width: 600px) and (orientation: portrait) {
        .file {
            width: 100vw;
        }
        .img {
            width: 100%;
        }

        .img,
        .video {
            object-position: center;
        }

        .zoom {
            width: unset;
            max-width: 170%;
            height: 150%;
        }

        .spinner {
            top: 0.5rem;
            right: 0.5rem;
            z-index: 20;
        }
    }
    @media (max-width: 600px) and (orientation: landscape) {
        .zoom {
            width: unset;
            max-width: 120%;
        }
    }
</style>
