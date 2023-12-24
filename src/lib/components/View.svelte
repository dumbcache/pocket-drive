<script lang="ts">
    import ImgNav from "$lib/components/files/ImgNav.svelte";
    import { onMount } from "svelte";
    import Dialog from "./Dialog.svelte";
    import { activeImage, mode } from "$lib/scripts/shared/stores";
    import closeIcon from "$lib/assets/close.svg?raw";
    import { changeImage } from "$lib/scripts/shared/utils";
    import Info from "./Info.svelte";

    export let files: FileResponse;
    let view: Dialog;
    let infoVisible = false;

    onMount(() => {
        view.show();
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
        e.deltaY > 0 ? changeImage("NEXT") : changeImage("PREV");
    }

    function handleClick(e: PointerEvent) {
        if (e.button != 0) return;
        const target = e.target as HTMLImageElement;
        const half = target.offsetWidth / 2;
        const clickx = e.clientX - target.getBoundingClientRect().left;
        clickx > half ? changeImage("NEXT") : changeImage("PREV");
    }

    function handleViewClose() {
        $mode = "";
        view.close();
    }
</script>

<Dialog bind:this={view}>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <artcle tabindex="0" id="view" on:keydown={handleKeyDown}>
        <section class="one" on:wheel|stopPropagation>
            <ImgNav {files} />
        </section>
        <section
            class="two preview"
            on:scroll|preventDefault
            on:wheel|preventDefault={handleWheel}
            on:pointerdown={handleClick}
        >
            <img
                class="preview-img"
                data-id={$activeImage.id}
                src={$activeImage.src}
                alt=""
            />
            <!-- <button
                class="btn info-toggle"
                on:click={() => (infoVisible = !infoVisible)}
                >{@html infoIcon}</button
            > -->
        </section>
        {#if infoVisible}
            <section class="three">
                <Info />
            </section>
        {/if}
    </artcle>
    <button class="btn view-close" on:click={handleViewClose}
        >{@html closeIcon}</button
    >
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
        /* border: 1px solid red; */
    }
    .one {
        min-width: 10%;
        max-width: 15%;
        overflow: auto;
        scroll-behavior: smooth;
        padding: 0rem 2rem;
    }
    .two {
        position: relative;
        margin: auto;
        max-width: 100%;
    }

    .three {
        min-width: 30rem;
        /* border: 1px solid red; */
    }
    .info-toggle {
        position: absolute;
        top: 0;
        right: 0;
    }

    .two img {
        display: block;
        width: auto;
        height: 100%;
        margin: auto;
        object-fit: contain;
        object-position: center;
    }
    .view-close {
        position: absolute;
        top: 2rem;
        right: 2rem;
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

        .info-toggle {
            /* display: none; */
        }
        .view-close {
            top: 0.5rem;
            right: 0.5rem;
        }
    }
</style>
