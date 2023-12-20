<script lang="ts">
    import { page } from "$app/stores";
    import beforeNavigate from "$lib/assets/beforeNavigate.svg?raw";
    import { previewItem } from "$lib/scripts/stores";

    let id: string;
    $: id = $page.params.id ?? "";
    let backButton: HTMLButtonElement;
    $: backButton &&
        (backButton.style.visibility = id === "r" ? "hidden" : "initial");
</script>

<button
    class="back-button btn"
    bind:this={backButton}
    on:click={() => {
        history.back();
        $previewItem = undefined;
    }}
>
    {@html beforeNavigate}
</button>

<style>
    .back-button {
        display: flex;
        align-items: center;
        font-size: 1.4rem;
    }
</style>
