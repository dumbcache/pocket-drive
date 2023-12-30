<script lang="ts">
    import Header from "$lib/components/Header.svelte";
    import Drop from "$lib/components/drops/Drop.svelte";
    import { updateRecents } from "$lib/scripts/shared/utils";
    import { onMount } from "svelte";
    import {
        checkRefreshTimeout,
        checkSessionTimeout,
    } from "$lib/scripts/shared/utils";

    onMount(() => {
        try {
            updateRecents();
            checkSessionTimeout();
            checkRefreshTimeout();
        } catch (error) {
            console.warn(error);
        }
    });
</script>

<svelte:window
    on:offline={() => {
        window.alert("You're offline");
    }}
    on:keydown
/>

<div class="layout">
    <Header />
    <slot />
    <Drop />
</div>

<style>
    .layout {
        display: flex;
    }

    @media (max-width: 800px) {
    }
    @media (max-width: 600px) {
        .layout {
            height: initial;
            display: initial;
        }
    }
</style>
