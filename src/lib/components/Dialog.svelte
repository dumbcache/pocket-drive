<script lang="ts">
    let dialog: HTMLDialogElement;

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
            // console.log(view);
        }
    }
    export function close() {
        dialog.close();
    }
    export function show() {
        dialog.showModal();
    }
</script>

<dialog id="dialog" bind:this={dialog} on:keydown={handleKeyDown}>
    <slot />
</dialog>

<style>
    #dialog {
        height: 100%;
        width: 100%;
        background-color: #12121205;
        backdrop-filter: blur(50px);
    }
</style>
