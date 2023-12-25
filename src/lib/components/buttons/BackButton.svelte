<script lang="ts">
    import { page } from "$app/stores";
    import beforeNavigate from "$lib/assets/beforeNavigate.svg?raw";
</script>

{#if $page.params?.id !== "r"}
    <button
        class="back-button btn"
        on:click={() => {
            history.back();
        }}
    >
        {@html beforeNavigate}
    </button>
{/if}

<style>
    .back-button {
        display: flex;
        align-items: center;
        font-size: 1.4rem;
    }
</style>
