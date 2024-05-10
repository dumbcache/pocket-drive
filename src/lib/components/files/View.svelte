<script lang="ts">
    import FileNav from "$lib/components/files/FileNav.svelte";
    import { onMount } from "svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { activeImage, mode, previewLoading } from "$lib/scripts/stores";
    import closeIcon from "$lib/assets/close.svg?raw";
    import infoIcon from "$lib/assets/arrowLeftDouble.svg?raw";
    import zoomInIcon from "$lib/assets/zoomIn.svg?raw";
    import zoomOutIcon from "$lib/assets/zoomOut.svg?raw";
    import urlIcon from "$lib/assets/url.svg?raw";
    import { changeImage } from "$lib/scripts/utils";
    import Info from "$lib/components/files/Info.svelte";
    import Spinner from "$lib/components/utils/Spinner.svelte";

    export let files: FileResponse;
    let dialog: Dialog;
    let infoVisible = false;
    let zoom = false;

    onMount(() => {
        dialog.show();
    });

    function handleKeyDown(e: KeyboardEvent) {
        e.preventDefault();
        e.stopPropagation();
        switch (e.key) {
            case "Escape":
                $mode = "";
                return;
            case "ArrowRight":
            case "ArrowDown":
                changeImage("NEXT");
                return;
            case "ArrowLeft":
            case "ArrowUp":
                changeImage("PREV");
                return;
        }
    }

    function handleWheel(e: WheelEvent) {
        if (zoom) return;
        e.preventDefault();
        e.deltaY > 0 ? changeImage("NEXT") : changeImage("PREV");
    }

    function handleClick(e: PointerEvent) {
        if (zoom) return;
        if (e.button != 0) return;
        const target = e.target as HTMLImageElement;
        const half = target.offsetWidth / 2;
        const clickx = e.clientX - target.getBoundingClientRect().left;
        clickx > half ? changeImage("NEXT") : changeImage("PREV");
    }

    function handleViewClose() {
        $mode = "";
        dialog.close();
    }
</script>

<Dialog bind:this={dialog}>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <artcle
        tabindex="0"
        id="view"
        on:keydown={handleKeyDown}
        on:dragstart|preventDefault
        on:wheel={(e) => {
            zoom || e.preventDefault();
        }}
    >
        <section class="one" on:wheel|stopPropagation>
            <FileNav {files} />
        </section>
        <section
            class="two preview"
            on:scroll|preventDefault
            on:wheel={handleWheel}
        >
            <video
                on:wheel|stopPropagation|preventDefault
                on:keydown|stopPropagation
                class="preview-video"
                data-id={$activeImage.id}
                src=""
                muted
                controls
                loop
                playsinline
            ></video>

            <img
                on:pointerup={handleClick}
                class="preview-img"
                class:zoom
                data-id={$activeImage.id}
                src={$activeImage.thumbnailLink}
                alt=""
            />
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
    {#if $previewLoading}
        <div class="spinner">
            <Spinner borderWidth="2px" width="1rem" height="1rem" />
        </div>
    {/if}
    <div class="action">
        {#if !infoVisible}
            <button
                class="btn s-prime info"
                title="info"
                on:click={() => (infoVisible = !infoVisible)}
                >{@html infoIcon}</button
            >
        {/if}
        {#if $activeImage.description}
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
        min-width: 10rem;
        max-width: 20rem;
        overflow: auto;
        scroll-behavior: smooth;
        padding: 0rem 2rem;
    }
    .two {
        margin: auto;
        max-width: 100%;
        min-width: 50%;
        overflow: auto;
    }

    .three {
        min-width: 40rem;
    }

    .preview-img,
    .preview-video {
        display: block;
        width: auto;
        height: 100%;
        margin: auto;
        object-fit: contain;
        object-position: center;
    }
    .preview-video {
        display: none;
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

    @media (max-width: 600px) {
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

        .preview-img,
        .preview-video {
            object-position: center;
        }

        .zoom {
            width: unset;
            max-width: 170%;
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
    }
</style>
