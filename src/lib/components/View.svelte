<script lang="ts">
    import { onMount } from "svelte";

    export let imgData, open: boolean;
    let view: HTMLDialogElement;
    onMount(() => {
        open && show();
    });

    function show() {
        view?.showModal();
    }

    export function close() {
        view?.close();
    }

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            // console.log(view);
        }
    }
</script>

<dialog id="view" bind:this={view} on:keydown={handleKeyDown}>
    <article class="view">
        <section class="left">
            <img src="" alt="" />
        </section>
        <section class="right">img data</section>
    </article>
</dialog>

<style>
    .view {
        height: 100vh;
        width: 100vw;
        background-color: #12121205;
        backdrop-filter: blur(10px);
        display: grid;
        place-content: center;
    }
</style>
