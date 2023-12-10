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
</script>

<button
    type="button"
    class="color-theme"
    aria-label="Dark mode"
    role="switch"
    aria-checked="false"
    title="toggle dark mode"
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
        padding: 0.5rem;
        border-radius: 50%;
        border: 1px solid var(--theme-button-outline);
        filter: none;
        cursor: pointer;
    }
    .color-theme:hover {
        border: none;
        outline: 1px solid #f0f;
    }
    .color-theme:active {
        padding: 0.8rem;
    }
</style>
