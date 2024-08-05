<script>
    import beforeNavigate from "$lib/assets/beforeNavigate.svg?raw";
    import { activeFolder } from "$lib/scripts/stores";
    import { getRoot } from "$lib/scripts/utils";
</script>

{#if window.history.length > 1 && $activeFolder?.id !== getRoot()}
    <button
        class="back-button btn s-prime"
        title="go back"
        on:click={() => {
            history.back();
        }}
    >
        {@html beforeNavigate}
    </button>
{/if}
