<script lang="ts">
    import beforeNavigate from "$lib/assets/beforeNavigate.svg?raw";
    import { tempStore } from "$lib/scripts/stores.svelte";
    import { getRoot } from "$lib/scripts/utils";
</script>

{#if window.history.length > 1 && tempStore.activeFolder?.id !== getRoot()}
    <button
        class="back-button btn s-prime"
        title="go back"
        onclick={() => {
            history.back();
        }}
    >
        {@html beforeNavigate}
    </button>
{/if}

<style>
    button {
        flex-shrink: 0;
    }
</style>
