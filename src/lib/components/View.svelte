<script lang="ts">
    import { activeImgs } from "$lib/scripts/stores";
    import ImgNav from "$lib/components/imgs/ImgNav.svelte";
    import { onMount } from "svelte";

    export let imgData;
    let view: HTMLDialogElement;

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            // console.log(view);
        }
    }
</script>

<dialog id="view" bind:this={view} on:keydown={handleKeyDown}>
    <article class="img-view">
        <nav class="img-nav">
            <ImgNav imgs={$activeImgs} />
        </nav>
        <section class="left">
            <img src="" alt="" />
        </section>
        <section class="right"></section>
    </article>
</dialog>

<style>
    #view {
        height: 100vh;
        width: 100vw;
        border: 1px solid #fff9;
        background: none;
        background-color: #12121205;
        backdrop-filter: blur(50px);
    }

    .img-view {
        height: 90%;
        width: 100%;
        background-color: #12121205;
        backdrop-filter: blur(50px);
        display: flex;
        flex-flow: row wrap;
    }
    .img-nav {
        max-width: 15rem;
        padding: 1rem;
        overflow-y: scroll;
        display: flex;
        flex-flow: column;
        align-items: center;
        gap: 1rem;
        background-color: #fff6;
    }
</style>
