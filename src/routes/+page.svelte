<script>
    import Info from "$lib/components/home/Info.svelte";
    import Footer from "$lib/components/home/Footer.svelte";
    import Title from "$lib/components/home/Title.svelte";
    import Gallery from "$lib/components/home/Gallery.svelte";
</script>

<main class="start-page">
    <Title />
    <Gallery />
    <Info />
    <Footer />
</main>

<style>
    .start-page {
        /* scroll-behavior: smooth;
        overflow-y: auto; */
        padding: 0rem 5rem;
    }

    .start-page :global(article:not(:first-child)) {
        padding-bottom: 5em;
    }

    @media (max-width: 600px) {
        .start-page {
            padding: 0rem 1rem;
        }
        .start-page :global(article:not(:first-child)) {
            padding-bottom: 3em;
        }
    }
</style>
