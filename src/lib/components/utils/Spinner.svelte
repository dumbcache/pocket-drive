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
        width: 5rem;
        height: 5rem;
        border: 5px solid var(--color-white-two);
        border-top: 5px solid var(--color-blue);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
</style>
