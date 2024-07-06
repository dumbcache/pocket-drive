<script lang="ts">
    import { navigating } from "$app/stores";
    import Spinner from "$lib/components/utils/Spinner.svelte";
    import { pocketState, progress, refresh } from "$lib/scripts/stores";
    import { onMount } from "svelte";
    import "./app.css";
    import { browser } from "$app/environment";
    import { get } from "svelte/store";

    let homeButton = "";
    let overlay: HTMLDivElement;

    if (browser) {
        pocketState.subscribe((val) => {
            window.localStorage.setItem("pocketState", val);
        });
    }

    onMount(async () => {
        const response = await fetch("/favicon.svg");
        homeButton = await response.text();
        setTimeout(() => {
            overlay.style.display = "none";
        }, 2000);
    });
</script>

{#if $navigating || $progress || $refresh}
    <div
        class="loading"
        on:wheel|preventDefault|stopPropagation
        on:scroll|preventDefault|stopPropagation
    >
        <Spinner />
    </div>
{/if}

<div class="overlay" bind:this={overlay}>
    <span class="icon">
        {@html homeButton}
    </span>
</div>

<slot />

<style>
    .loading {
        position: fixed;
        top: 0;
        width: 100%;
        height: 100%;
        display: grid;
        place-content: center;
        backdrop-filter: blur(0.5rem);
        -webkit-backdrop-filter: blur(0.5rem);
        z-index: 10;
    }

    .overlay {
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        /* height: 100vh;
        width: 100vw; */
        z-index: 1000;
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
        -webkit-animation: zoom 1s alternate infinite;
        animation: zoom 1s alternate infinite;
    }
</style>
