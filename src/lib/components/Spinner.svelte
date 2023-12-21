<div class="spinner"></div>

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
        border-top: 5px solid var(--color-light-blue);
        border-radius: 50%;
        animation: spin 1s linear infinite;
    }
</style>
