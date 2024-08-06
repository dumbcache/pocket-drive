<script lang="ts">
    import lightModeIcon from "$lib/assets/lightMode.svg?raw";
    import darkModeIcon from "$lib/assets/darkMode.svg?raw";
    import { preferences } from "$lib/scripts/stores.svelte";
</script>

<button
    type="button"
    class="color-theme btn s-prime"
    title="toggle theme"
    role="switch"
    aria-label="Toggle dark mode"
    aria-checked={preferences.theme === "" ? "false" : "true"}
    on:click={() => preferences.toggleTheme()}
>
    {#if preferences.theme === ""}
        {@html lightModeIcon}
    {:else}
        {@html darkModeIcon}
    {/if}
</button>

<style>
    .color-theme {
        block-size: 3.6rem;
        inline-size: 3.6rem;
        padding: 0.6rem;
        border-radius: 50%;
        filter: none;
    }
    .color-theme:hover {
        border: none;
        padding: 0.4rem;
    }
    .color-theme:active {
        padding: 0.9rem;
    }

    .color-theme:hover :global(svg) {
        fill: var(--color-focus);
    }

    @media (max-width: 600px) {
        .color-theme {
            padding: 0rem;
            block-size: var(--primary-icon-size);
            inline-size: var(--primary-icon-size);
        }
        .color-theme:hover {
            padding: 0rem;
        }
        .color-theme:active {
            padding: 0.2rem;
        }
    }
</style>
