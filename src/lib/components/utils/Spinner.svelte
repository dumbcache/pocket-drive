<script>
    export let borderWidth = "5px";
    export let width = "5rem";
    export let height = "5rem";
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
