<script>
    import { onMount } from "svelte";

    let homeIcon = $state("");

    onMount(async () => {
        const response = await fetch("/favicon.svg");
        homeIcon = await response.text();
    });
</script>

<span class="icon">{@html homeIcon}</span>
