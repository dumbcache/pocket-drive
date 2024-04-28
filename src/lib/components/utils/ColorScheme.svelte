<script lang="ts">
    import lightModeIcon from "$lib/assets/lightMode.svg?raw";
    import darkModeIcon from "$lib/assets/darkMode.svg?raw";
    import { onMount } from "svelte";

    let theme = "";
    onMount(() => {
        theme = window.localStorage.getItem("theme") ?? "";
        const root = document.documentElement;
        theme &&
            (root.classList.contains("dark") || root.classList.toggle("dark"));
    });
    function toggleTheme() {
        theme = theme === "" ? "dark" : "";
        window.localStorage.setItem("theme", theme);
        const root = document.documentElement;
        root.classList.toggle("dark");
    }

    function handleKeyDown(e: KeyboardEvent) {
        e.key === "c" && toggleTheme();
    }
</script>

<svelte:window on:keydown={handleKeyDown} />

<button
    type="button"
    class="color-theme btn s-prime"
    title="toggle theme"
    role="switch"
    aria-label="Toggle dark mode"
    aria-checked={theme === "" ? "false" : "true"}
    on:click={toggleTheme}
>
    {#if theme === ""}
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
