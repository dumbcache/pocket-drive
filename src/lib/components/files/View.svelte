<script lang="ts">
    import { onMount } from "svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import {
        activeImage,
        imageCache,
        imageFetchLog,
        mode,
    } from "$lib/scripts/stores";
    import closeIcon from "$lib/assets/close.svg?raw";
    import infoIcon from "$lib/assets/arrowLeftDouble.svg?raw";
    import zoomInIcon from "$lib/assets/zoomIn.svg?raw";
    import zoomOutIcon from "$lib/assets/zoomOut.svg?raw";
    import urlIcon from "$lib/assets/url.svg?raw";
    import { fetchImgPreview } from "$lib/scripts/utils";
    import Info from "$lib/components/files/Info.svelte";
    import Spinner from "$lib/components/utils/Spinner.svelte";
    import FileNav from "$lib/components/files/FileNav.svelte";

    export let files: File[];
    let dialog: Dialog;
    let infoVisible = false;
    let zoom = false;
    let preview: HTMLElement, navigation: HTMLElement;
    let isDragging = false;
    let startX: number;
    let scrollLeft: number;
    let active = false;
    let previewObserver: IntersectionObserver;

    onMount(() => {
        setTimeout(() => {
            previewInspection();
        }, 2000);
        setTimeout(() => {
            if ($activeImage) {
                const ele = preview.querySelector(
                    `[data-id="${$activeImage.id}"]`
                );
                ele?.scrollIntoView({
                    behavior: "instant",
                    block: "center",
                    inline: "center",
                });
            }
        }, 0);
        dialog.show();
    });

    function handlePointerDown(e: MouseEvent) {
        isDragging = true;
        startX = e.pageX - preview.offsetLeft;
        scrollLeft = preview.scrollLeft;
    }

    function handlePointerMove(e: MouseEvent) {
        if (!isDragging) return;
        e.preventDefault();
        const x = e.pageX - preview.offsetLeft;
        const walk = (x - startX) * 4; // Adjust scroll speed multiplier as needed
        preview.scrollLeft = scrollLeft - walk;
    }

    function handlePointerUp(e: MouseEvent) {
        isDragging = false;
    }

    function handleKeyDown(e: KeyboardEvent) {
        e.preventDefault();
        e.stopPropagation();
        switch (e.key) {
            case "Escape":
                $mode = "";
                return;
            case "ArrowRight":
            case "ArrowDown":
                preview.scrollBy({ left: 100, behavior: "instant" });
                return;
            case "ArrowLeft":
            case "ArrowUp":
                preview.scrollBy({ left: -100, behavior: "instant" });
                return;
        }
    }

    function handleWheel(e: WheelEvent) {
        if (zoom) return;
        e.preventDefault();
        e.deltaY > 0
            ? preview.scrollBy({ left: 100, behavior: "smooth" })
            : preview.scrollBy({ left: -100, behavior: "smooth" });
    }
    function handleClick(e: PointerEvent) {
        if (zoom) return;
        if (e.button != 0) return;
        const target = e.target as HTMLImageElement;
        if (target) {
            if (target.localName === "video") return;
            const half = target.offsetWidth / 2;
            const clickx = e.clientX - target.getBoundingClientRect().left;
            clickx > half
                ? preview.scrollBy({ left: 100, behavior: "instant" })
                : preview.scrollBy({ left: -100, behavior: "instant" });
        }
    }

    function handleViewClose() {
        $mode = "";
        dialog.close();
        imageCache.clear();
    }

    function changeHandler(e: CustomEvent) {
        let id = e.detail.id;
        const ele = preview.querySelector(`[data-id="${id}"]`);
        ele?.scrollIntoView({
            behavior: "instant",
            block: "center",
            inline: "center",
        });
    }

    function previewInspection() {
        previewObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        let target = entry.target as HTMLImageElement;
                        let { id } = target.dataset;
                        if (id) {
                            if ($activeImage.id !== id) {
                                const [file] = files.filter(
                                    (file) => file.id === id
                                );
                                activeImage.set(file);
                            }
                            if (!imageCache.has(id)) {
                                if (!imageFetchLog.has(id)) {
                                    // $previewLoading = true;
                                    target.nextElementSibling.style.display =
                                        "initial";
                                    fetchImgPreview(id);
                                    imageFetchLog.add(id);
                                    return;
                                }
                            } else {
                                if (!target.src.startsWith("blob:")) {
                                    target.src = imageCache.get(id);
                                }
                            }
                        }
                    }
                });
            },
            { root: preview, threshold: 0.5 }
        );
        files?.forEach((item) => {
            let id = item.id;
            let li = preview?.querySelector(`[data-id="${id}"]`);
            li && previewObserver.observe(li);
        });
    }
</script>

<Dialog bind:this={dialog}>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <artcle
        tabindex="0"
        id="view"
        role="dialog"
        on:keydown={handleKeyDown}
        on:dragstart|preventDefault
        on:wheel={(e) => {
            zoom || e.preventDefault();
        }}
    >
        <section
            class="one nav"
            bind:this={navigation}
            on:wheel|stopPropagation
        >
            <FileNav {files} on:change={changeHandler} />
        </section>
        <section
            class="two preview"
            role="dialog"
            on:scroll|preventDefault
            on:wheel={handleWheel}
            on:mousedown={handleClick}
            on:keydown
            on:mouseleave={handlePointerUp}
            on:mouseup={handlePointerUp}
            on:mousedown={handlePointerDown}
            on:mousemove={handlePointerMove}
            bind:this={preview}
        >
            {#each files as file}
                <div class="file">
                    {#if file.mimeType.match("image/")}
                        <img
                            class:zoom
                            class:active
                            class="img"
                            src={file.thumbnailLink}
                            alt=""
                            data-id={file.id}
                            data-src={file.thumbnailLink}
                            on:error={(e) => {
                                e.target.src = file.thumbnailLink;
                            }}
                        />
                    {:else}
                        <!-- <img
                            class:zoom
                            class="img"
                            src={file.thumbnailLink}
                            alt=""
                            data-id={$activeImage.id}
                        /> -->
                        <video
                            on:wheel|preventDefault
                            on:keydown|stopPropagation
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
                    <div class="spinner">
                        <Spinner borderWidth="2px" width="1rem" height="1rem" />
                    </div>
                </div>
            {/each}
        </section>
        {#if infoVisible}
            <section class="three">
                <Info on:close={() => (infoVisible = !infoVisible)} />
            </section>
        {/if}
    </artcle>
    <button class="btn s-prime close" on:click={handleViewClose}
        >{@html closeIcon}</button
    >
    <!-- {#if $previewLoading}
        <div class="spinner">
            <Spinner borderWidth="2px" width="1rem" height="1rem" />
        </div>
    {/if} -->
    <div class="action">
        {#if !infoVisible}
            <button
                class="btn s-prime info"
                title="info"
                on:click={() => (infoVisible = !infoVisible)}
                >{@html infoIcon}</button
            >
        {/if}
        {#if $activeImage?.description}
            <a
                title="go to website"
                href={$activeImage.description}
                class="btn s-second url">{@html urlIcon}</a
            >
        {/if}
        <button class="btn s-prime" title="zoom" on:click={() => (zoom = !zoom)}
            >{@html zoom ? zoomOutIcon : zoomInIcon}</button
        >
    </div>
</Dialog>

<style>
    #view {
        box-sizing: border-box;
        height: 100%;
        padding: 5rem;
        outline: none;
        display: flex;
        flex-flow: row nowrap;
        gap: 5rem;
    }
    section {
        height: 100%;
    }
    .one {
        min-width: 15rem;
        max-width: 20rem;
        overflow: auto;
        scroll-behavior: smooth;
        padding: 0rem 2rem;
    }
    .two {
        margin: auto;
        max-width: 100%;
        min-width: 50%;
        overflow-y: hidden;
        overflow-x: scroll;
        display: flex;
        gap: 5rem;
        flex-flow: row nowrap;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
    }
    .two::-webkit-scrollbar,
    .file::-webkit-scrollbar {
        display: none;
    }
    .three {
        min-width: 30rem;
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

    .close {
        position: absolute;
        top: 2rem;
        z-index: 10;
        left: 2rem;
    }

    .spinner {
        position: absolute;
        z-index: 10;
        top: 2.7rem;
        right: 13rem;
        display: none;
    }

    .action {
        display: flex;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 2rem;
        right: 2rem;
        gap: 1rem;
    }

    @media (max-width: 600px) and (orientation: portrait) {
        #view {
            flex-flow: column-reverse;
            padding: 0rem;
            gap: 2rem;
        }
        .one {
            max-width: 100%;
            margin: auto;
            min-height: 10%;
            max-height: 10%;
            padding: 1rem 0rem;
        }

        .two {
            min-height: 85%;
            max-height: 85%;
            min-width: 100%;
        }

        .three {
            min-width: 100%;
            height: 100%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            margin: auto;
            position: absolute;
            z-index: 11;
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
        .action {
            bottom: 8rem;
            top: unset;
        }

        .info {
            rotate: 90deg;
        }
        .close {
            top: 0.5rem;
            left: 0.5rem;
        }
        .spinner {
            top: 0.5rem;
            right: 0.5rem;
        }
        .one::-webkit-scrollbar {
            display: none;
        }
    }
    @media (max-width: 600px) and (orientation: landscape) {
        #view {
            padding: 2.5rem;
        }
        .one {
            min-width: 10rem;
        }
        .zoom {
            width: unset;
            max-width: 120%;
        }
    }
</style>
