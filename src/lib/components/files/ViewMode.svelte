<script lang="ts">
    import { onMount, tick } from "svelte";
    import {
        activeImage,
        fileStore,
        imageCache,
        imageFetchLog,
        mode,
    } from "$lib/scripts/stores";
    import closeIcon from "$lib/assets/close.svg?raw";
    import infoIcon from "$lib/assets/arrowLeftDouble.svg?raw";
    import zoomInIcon from "$lib/assets/zoomIn.svg?raw";
    import zoomOutIcon from "$lib/assets/zoomOut.svg?raw";
    import expandIcon from "$lib/assets/expand.svg?raw";
    import urlIcon from "$lib/assets/url.svg?raw";
    import { fetchImgPreview } from "$lib/scripts/utils";
    import Info from "$lib/components/files/Info.svelte";
    import Spinner from "$lib/components/utils/Spinner.svelte";
    import FileNav from "$lib/components/files/FileNav.svelte";
    import Favorite from "../utils/Favorite.svelte";

    export let files: File[];
    let infoVisible = false;
    let zoom = false;
    let expand = false;
    let preview: HTMLElement, navigation: HTMLElement;
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
    });

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
        e.preventDefault();
        const target = e.target as HTMLImageElement;
        e.deltaY > 0
            ? preview.scrollBy({ left: target.offsetWidth, behavior: "smooth" })
            : preview.scrollBy({
                  left: -target.offsetWidth,
                  behavior: "smooth",
              });
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

    function handleViewClose() {
        $mode = "";
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

    async function toggleFav(id: string) {
        activeImage.update((prev) => ({ ...prev, starred: !prev.starred }));
        await tick();
        fileStore.update((prev) => {
            return {
                nextPageToken: prev?.nextPageToken,
                files: prev?.files.map((f) => {
                    if (f.id === id) {
                        f.starred = !f.starred;
                    }
                    return f;
                }),
            };
        });
    }

    function previewInspection() {
        previewObserver = new IntersectionObserver(
            (entries) => {
                entries.forEach((entry) => {
                    if (entry.isIntersecting) {
                        let target = entry.target as HTMLImageElement;
                        let { id, src } = target.dataset;
                        if (!id) return;
                        if (!target.src && src) target.src = src;
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
                });
            },
            { root: preview, threshold: 0.1 }
        );
        files?.forEach((item) => {
            let id = item.id;
            let li = preview?.querySelector(`[data-id="${id}"]`);
            li && previewObserver.observe(li);
        });
    }
</script>

<div class="view-container" on:wheel|preventDefault>
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
            style:display={expand ? "none" : "initial"}
            bind:this={navigation}
            on:wheel|stopPropagation
        >
            <FileNav {files} {preview} on:change={changeHandler} />
        </section>
        <section
            class="two preview"
            role="dialog"
            on:scroll|preventDefault
            on:wheel|stopPropagation={handleWheel}
            on:click|stopPropagation={handleClick}
            on:keydown
            bind:this={preview}
        >
            {#each files as file}
                <div class="file">
                    {#if file.mimeType.match("image/")}
                        <img
                            class:zoom
                            class:active
                            class="img"
                            src=""
                            alt=""
                            data-id={file.id}
                            data-src={file.thumbnailLink}
                            on:error={(e) => {
                                e.target.src = file.thumbnailLink;
                            }}
                        />
                    {:else}
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
    <div class="action" class:expand>
        {#if $activeImage?.description}
            <a
                title="go to website"
                href={$activeImage.description}
                class="btn s-second url">{@html urlIcon}</a
            >
        {/if}
        <Favorite
            id={$activeImage.id}
            starred={$activeImage.starred}
            on:fav={() => toggleFav($activeImage.id)}
        />
        <button
            class="btn s-prime"
            title="zoom"
            on:click|stopPropagation|preventDefault={() => (zoom = !zoom)}
            >{@html zoom ? zoomOutIcon : zoomInIcon}</button
        >
        {#if !infoVisible}
            <button
                class="btn s-prime info"
                title="info"
                on:click|stopPropagation|preventDefault={() =>
                    (infoVisible = !infoVisible)}>{@html infoIcon}</button
            >
        {/if}
        <button
            class="btn s-prime expand"
            title="expand"
            on:click|stopPropagation|preventDefault={() => (expand = !expand)}
            >{@html expandIcon}</button
        >
    </div>
</div>

<style>
    .view-container {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 5;
        background-color: #12121205;
        backdrop-filter: blur(50px);
        -webkit-backdrop-filter: blur(50px);
        /* background-color: var(--color-backdrop); */
    }

    #view {
        box-sizing: border-box;
        height: 100%;
        padding: 3rem 6rem;
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
        position: absolute;
        min-width: 30rem;
        right: 0;
        top: 0;
        z-index: 1;
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
        left: 2rem;
        z-index: 10;
    }

    .spinner {
        position: absolute;
        z-index: 10;
        top: 20rem;
        right: 3rem;
        display: none;
    }

    .action {
        display: flex;
        flex-flow: column-reverse nowrap;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 2rem;
        right: 2rem;
        gap: 1.5rem;
    }

    .expand {
        display: none;
    }
    @media (max-width: 600px) and (orientation: portrait) {
        #view {
            flex-flow: column-reverse;
            padding: 0rem;
            padding-bottom: 0.5rem;
            gap: 1rem;
        }
        .one {
            max-width: 100%;
            /* margin: auto; */
            min-height: 10%;
            max-height: 10%;
            padding: 0.5rem 1rem;
            overflow: hidden;
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
        .action {
            bottom: 6rem;
            top: unset;
            right: 2rem;
            flex-flow: row nowrap;
        }

        .expand {
            display: flex;
            bottom: 1rem;
        }
        .info {
            rotate: 90deg;
        }
        .close {
            top: 0rem;
            left: 0rem;
            box-sizing: content-box;
            padding: 0.5rem;
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
