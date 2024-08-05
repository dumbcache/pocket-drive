<script lang="ts">
    import beforeNavigate from "$lib/assets/beforeNavigate.svg?raw";
    import { temp } from "$lib/scripts/state.svelte";
    import { getRoot } from "$lib/scripts/utils";
</script>

{#if window.history.length > 1 && temp.activeFolder?.id !== getRoot()}
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
