<script lang="ts">
    let dialog: HTMLDialogElement;

    function handleKeyDown(e: KeyboardEvent) {
        if (e.key === "Escape") {
        }
    }
    export function close() {
        dialog.close();
    }
    export function show() {
        dialog.showModal();
    }
</script>

<dialog
    id="dialog"
    bind:this={dialog}
    on:keydown={handleKeyDown}
    on:wheel|preventDefault
>
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
        border: none;
        outline: none;
        /* margin: 0; */
        padding: 2rem;
    }
</style>
