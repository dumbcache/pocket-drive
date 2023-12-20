<script lang="ts">
    import spinnerIcon from "$lib/assets/spinner.svg?raw";
</script>

<div class="spinner">{@html spinnerIcon}</div>

<style>
    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(180deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }
    .spinner {
        width: 10rem;
        -webkit-animation: spin 1.5s linear 0s infinite;
        animation: spin 1s linear 0s infinite;
    }
    .spinner :global(svg) {
        fill: var(--primary-svg-fill);
    }
</style>
