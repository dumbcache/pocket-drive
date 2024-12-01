<script lang="ts">
    import pic1 from "$lib/assets/about/pic1.webp";
    import pic2 from "$lib/assets/about/pic2.webp";
    import pic1dark from "$lib/assets/about/pic1dark.webp";
    import pic2dark from "$lib/assets/about/pic2dark.webp";
    import { preferences } from "$lib/scripts/stores.svelte";

    let one = $state(pic1);
    let two = $state(pic2);
    $effect(() => {
        if (preferences.theme === "") {
            one = pic1;
            two = pic2;
        } else {
            one = pic1dark;
            two = pic2dark;
        }
    });
</script>

<article class="article two">
    <section class="gallery-section">
        <figure class="gallery-item">
            <img src={one} class="pic pic11" alt="UI desktop" data-nosnippet />
            <figcaption>UI Desktop</figcaption>
        </figure>
        <figure class="gallery-item">
            <img src={two} class="pic pic12" alt="UI mobile" data-nosnippet />
            <figcaption>UI Mobile</figcaption>
        </figure>
    </section>
</article>

<style>
    .gallery-section {
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        justify-content: space-evenly;
        gap: 5rem 2rem;
    }
    .gallery-item {
        display: flex;
        flex-flow: column;
    }
    .pic {
        max-width: 100%;
        max-height: 40rem;
        object-fit: contain;
        border: 1px solid var(--color-lite);
    }

    figcaption {
        background: var(--color-bg-one);
        text-align: center;
        padding: 0.5rem;
        font-size: 0.9rem;
    }

    @media (max-width: 600px) {
        .gallery-section {
            justify-content: center;
            gap: 2rem;
            padding: 0rem;
        }
        .pic {
            max-height: 30rem;
        }
    }
</style>
