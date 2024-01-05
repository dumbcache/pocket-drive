<script lang="ts">
    import FileNav from "$lib/components/files/FileNav.svelte";
    import { onMount } from "svelte";
    import Dialog from "$lib/components/Dialog.svelte";
    import { activeImage, mode } from "$lib/scripts/shared/stores";
    import closeIcon from "$lib/assets/close.svg?raw";
    import infoIcon from "$lib/assets/info.svg?raw";
    import { changeImage } from "$lib/scripts/shared/utils";
    import Info from "$lib/components/files/Info.svelte";

    export let files: FileResponse;
    let dialog: Dialog;
    let infoVisible = false;

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
        on:wheel|preventDefault
    >
        <section class="one" on:wheel|stopPropagation>
            <FileNav {files} />
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
                <Info on:close={() => (infoVisible = !infoVisible)} />
            </section>
        {/if}
    </artcle>
    <button class="btn close" on:click={handleViewClose}
        >{@html closeIcon}</button
    >
    {#if !infoVisible}
        <button class="btn info" on:click={() => (infoVisible = !infoVisible)}
            >{@html infoIcon}</button
        >
    {/if}
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
        min-width: 10rem;
        max-width: 20rem;
        overflow: auto;
        scroll-behavior: smooth;
        padding: 0rem 2rem;
    }
    .two {
        position: relative;
        margin: auto;
        max-width: 100%;
        min-width: 50%;
    }

    .three {
        min-width: 40rem;
        /* border: 1px solid red; */
    }

    .two img {
        display: block;
        width: auto;
        height: 100%;
        margin: auto;
        object-fit: contain;
        object-position: center;
    }
    .close {
        position: absolute;
        top: 2rem;
        left: 2rem;
    }
    .info {
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
        .three {
            min-width: 100%;
            height: 100%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            margin: auto;
            position: absolute;
            z-index: 1;
        }
        .info {
            /* display: none; */
            /* top: 0.5rem; */
            position: absolute;
            bottom: 8rem;
            right: 0.5rem;
            top: unset;
            height: fit-content;
        }
        .close {
            top: 0.5rem;
            left: 0.5rem;
        }
    }
</style>
