<script>
    import { browser } from "$app/environment";
    import { goto } from "$app/navigation";
    import { navigating } from "$app/stores";
    import Spinner from "$lib/components/Spinner.svelte";
    import { isLoggedin } from "$lib/scripts/shared/stores";
    import "./app.css";
</script>

{#if $navigating}
    <div class="loading">
        <Spinner />
    </div>
{/if}
<slot />

<style>
    .loading {
        position: fixed;
        top: 0;
        width: 100%;
        height: 100%;
        display: grid;
        place-content: center;
        background-color: #0007;
        backdrop-filter: blur(1px);
        z-index: 10;
    }
</style>
