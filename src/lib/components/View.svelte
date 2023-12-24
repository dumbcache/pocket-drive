<script lang="ts">
    import { activeImgs } from "$lib/scripts/stores";
    import ImgNav from "$lib/components/files/ImgNav.svelte";
    import { onMount } from "svelte";
    import Dialog from "./Dialog.svelte";
    import { activeImage, mode } from "$lib/scripts/shared/stores";
    import closeIcon from "$lib/assets/close.svg?raw";
    import { changeImage } from "$lib/scripts/shared/utils";

    export let files: FileResponse;
    let view: Dialog;

    onMount(() => {
        view.show();
    });

    function handleKeyDown(e: KeyboardEvent) {
        e.preventDefault();
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

    function handleViewClose() {
        $mode = "";
        view.close();
    }
</script>

<Dialog bind:this={view}>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <artcle tabindex="0" id="view" on:keydown={handleKeyDown}>
        <section class="one">
            <ImgNav {files} />
        </section>
        <section
            class="two preview"
            on:scroll|preventDefault
            on:wheel|preventDefault
        >
            <img
                class="preview-img"
                data-id={$activeImage.id}
                src={$activeImage.src}
                alt=""
            />
        </section>
        <section class="three"></section>
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
    }
    section {
        height: 100%;
        /* border: 1px solid red; */
    }
    .one {
        min-width: 10%;
        max-width: 15%;
        padding: 0rem 2rem;
        overflow: auto;
        scroll-behavior: smooth;
    }
    .two {
        margin: auto;
        max-width: 100%;
        /* max-width: 100%; */
    }
    .three {
        /* display: none; */
        /* width: 20%; */
    }

    .two img {
        display: block;
        width: 100%;
        height: 100%;
        margin: auto;
        object-fit: contain;
    }
    .view-close {
        position: absolute;
        top: 2rem;
        right: 2rem;
    }
    @media (max-width: 600px) {
        #view {
            flex-flow: column-reverse;
            padding: 1rem;
        }
        .two {
        }
        .one {
            max-width: initial;
            padding: 2rem 0rem;
            height: fit-content;
        }

        .two img {
            height: unset;
            width: 100%;
        }
    }
</style>
