<script lang="ts">
    import { navigating } from "$app/stores";
    import { browser } from "$app/environment";
    import Spinner from "$lib/components/utils/Spinner.svelte";
    import { onDestroy, onMount } from "svelte";
    import "./app.css";
    import type { Unsubscriber } from "svelte/store";
    import { loadGSIScript } from "$lib/scripts/login";
    import { disableScrolling, enableScorlling } from "$lib/scripts/utils";
    import { states } from "$lib/scripts/stores.svelte";
    import HomeIcon from "$lib/components/HomeIcon.svelte";

    let { children } = $props();

    let startup: HTMLDivElement;

    let pocketStateUnsubscribe: Unsubscriber;
    let navigatingUnsubscribe: Unsubscriber;

    if (browser) {
        navigatingUnsubscribe = navigating.subscribe((val) => {
            val ? disableScrolling() : enableScorlling();
        });
        // progressUnsubscribe = progress.subscribe((val) => {
        //     val ? disableScrolling() : enableScorlling();
        // });
    }

    onMount(async () => {
        disableScrolling();

        setTimeout(() => {
            enableScorlling();
            startup.style.display = "none";
        }, 2000);

        try {
            loadGSIScript();
        } catch (error) {
            console.warn("Error in loading GSIScript:", error);
        }
    });

    onDestroy(() => {
        pocketStateUnsubscribe && pocketStateUnsubscribe();
        navigatingUnsubscribe && navigatingUnsubscribe();
        // progressUnsubscribe && progressUnsubscribe();
    });
</script>

{#if $navigating || states.progress }
    <div class="loading">
        <Spinner />
    </div>
{/if}

<div class="startup" bind:this={startup}>
    <span class="icon">
        <HomeIcon/>
    </span>
</div>

{@render children()}

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
