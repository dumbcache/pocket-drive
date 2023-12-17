<script>
    import { onMount } from "svelte";
    import "./app.css";
    import {
        checkRefreshTimeout,
        checkSessionTimeout,
    } from "$lib/scripts/utils";

    onMount(() => {
        checkSessionTimeout();
        checkRefreshTimeout();
    });
</script>

<slot />
