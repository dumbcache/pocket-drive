<script lang="ts">
    import { mode } from "$lib/scripts/stores";
    import { onDestroy } from "svelte";

    let dialog: HTMLDialogElement;

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
        }
    }
    export function close() {
        $mode = "";
        dialog.close();
    }
    export function show() {
        dialog.showModal();
    }
    onDestroy(() => {});
</script>

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<dialog id="dialog" bind:this={dialog} on:keydown={handleKeyDown}>
    <slot />
</dialog>

<style>
    #dialog {
        height: 100%;
        width: 100%;
        color: inherit;
        background-color: inherit;
        background-color: #12121205;
        backdrop-filter: blur(50px);
        -webkit-backdrop-filter: blur(50px);
        border: none;
        outline: none;
        /* margin: 0; */
        padding: 2rem;
    }
</style>
