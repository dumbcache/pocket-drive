<script>
    let { borderWidth = "5px", width = "5rem", height = "5rem" } = $props();
</script>

<div
    class="spinner"
    style:border-width={borderWidth}
    style:width
    style:height
></div>

<style>
    @keyframes spin {
        100% {
            transform: rotate(360deg);
        }
    }
    .spinner {
        border-style: solid;
        border-color: var(--color-white-three);
        border-top-color: var(--color-blue);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
</style>
