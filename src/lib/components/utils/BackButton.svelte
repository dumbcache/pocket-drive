<script>
    import beforeNavigate from "$lib/assets/beforeNavigate.svg?raw";
    import { activeParent, storeSnap } from "$lib/scripts/stores";
    import { getRoot } from "$lib/scripts/utils";
</script>

{#if window.history.length > 1 && $activeParent?.id !== getRoot()}
    <button
        class="back-button btn s-prime"
        title="go back"
        on:click={() => {
            storeSnap();
            history.back();
        }}
    >
        {@html beforeNavigate}
    </button>
{/if}
