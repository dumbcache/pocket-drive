<script lang="ts">
    import Tools from "$lib/components/actions/Tools.svelte";
    import BackButton from "$lib/components/buttons/BackButton.svelte";
</script>

<nav class="navigation">
    <div class="back">
        <BackButton />
    </div>
    <Tools />
</nav>

<style>
    .navigation {
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: space-between;
        background: inherit;
        gap: 1rem;
        z-index: inherit;
    }
    .back {
        display: none;
    }

    @media (max-width: 600px) {
        .navigation {
            position: sticky;
            top: 0;
            flex-flow: row nowrap;
            padding: 1rem 0.5rem;
        }
        .back {
            display: initial;
        }
    }
</style>
