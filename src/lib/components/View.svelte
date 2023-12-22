<script lang="ts">
    import { activeImgs } from "$lib/scripts/stores";
    import ImgNav from "$lib/components/files/ImgNav.svelte";
    import { onMount } from "svelte";
    import Dialog from "./Dialog.svelte";
    import { mode } from "$lib/scripts/shared/stores";

    export let files;
    let view: Dialog;

    onMount(() => {
        view.show();
    });

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            $mode = "";
        }
    }
</script>

<Dialog bind:this={view}>
    <!-- svelte-ignore a11y-no-noninteractive-tabindex -->
    <artcle tabindex="0" id="view" on:keydown={handleKeyDown}>
        <section class="one">
            <ImgNav {files} />
        </section>
        <section class="two">
            <img src="" alt="" />
        </section>
        <section class="three"></section>
    </artcle>
</Dialog>

<style>
    #view {
        box-sizing: border-box;
        display: grid;
        grid-template-columns: minmax(auto, 15rem) 1fr minmax(auto, 30rem);
        grid-template-areas: "one two three";
        height: 100%;
        /* width: 100%; */
        /* border: 1px solid #fff9; */
        padding: 5rem;
        outline: none;
    }
    section {
        height: 100%;
        /* border: 1px solid red; */
    }
    .one {
        padding: 1rem;
        overflow: auto;
        scroll-behavior: smooth;
    }
    .two {
        /* max-width: 100%; */
    }
    .three {
        /* max-width: 20%; */
    }
</style>
