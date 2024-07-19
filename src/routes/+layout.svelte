<script lang="ts">
    import { navigating } from "$app/stores";
    import { browser } from "$app/environment";
    import Spinner from "$lib/components/utils/Spinner.svelte";
    import { pocketState, progress, theme } from "$lib/scripts/stores";
    import { onDestroy, onMount } from "svelte";
    import "./app.css";
    import type { Unsubscriber } from "svelte/store";

    let homeIcon = "";
    let startup: HTMLDivElement;

    let pocketStateUnsubscribe: Unsubscriber;
    let navigatingUnsubscribe: Unsubscriber;
    let progressUnsubscribe: Unsubscriber;

    if (browser) {
        pocketStateUnsubscribe = pocketState.subscribe((val) => {
            window.localStorage.setItem("pocketState", val);
        });

        navigatingUnsubscribe = navigating.subscribe((val) => {
            document.body.style.overflow = val ? "hidden" : "auto";
        });
        progressUnsubscribe = progress.subscribe((val) => {
            document.body.style.overflow = val ? "hidden" : "auto";
        });
    }

    onMount(async () => {
        document.body.style.overflow = "hidden";

        try {
            const response = await fetch("/favicon.svg");
            homeIcon = await response.text();
        } catch (error) {
            console.error("Failed to fetch favicon:", error);
        }

        setTimeout(() => {
            document.body.style.overflow = "auto";
            startup.style.display = "none";
        }, 2000);

        $theme = window.localStorage.getItem("theme") ?? "";
        const root = document.documentElement;
        if ($theme) {
            root.classList.contains("dark") || root.classList.toggle("dark");
        } else {
            root.classList.contains("dark") && root.classList.toggle("dark");
        }
    });

    onDestroy(() => {
        pocketStateUnsubscribe && pocketStateUnsubscribe();
        navigatingUnsubscribe && navigatingUnsubscribe();
        progressUnsubscribe && progressUnsubscribe();
    });
</script>

{#if $navigating || $progress}
    <div class="loading">
        <Spinner />
    </div>
{/if}

<div class="startup" bind:this={startup}>
    <span class="icon">
        {@html homeIcon}
    </span>
</div>

<slot />

<style>
    .loading,
    .startup {
        position: fixed;
        top: 0;
        width: 100%;
        height: 100%;
        display: grid;
        place-content: center;
        z-index: 1000;
    }

    .loading {
        backdrop-filter: blur(0.5rem);
        -webkit-backdrop-filter: blur(0.5rem);
    }

    .startup {
        background: inherit;
    }

    @keyframes zoom {
        0% {
            width: 3rem;
        }
        100% {
            width: 5rem;
        }
    }

    .icon {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        display: block;
        width: 5rem;
        -webkit-animation: zoom 1s alternate linear infinite;
        animation: zoom 1s alternate linear infinite;
    }
</style>
