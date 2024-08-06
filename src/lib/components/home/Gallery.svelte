<script lang="ts">
    import pic1 from "$lib/assets/about/pic1.webp";
    import pic2 from "$lib/assets/about/pic2.webp";
    import pic3 from "$lib/assets/about/pic3.webp";
    import pic4 from "$lib/assets/about/pic4.webp";
    import pic1dark from "$lib/assets/about/pic1dark.webp";
    import pic2dark from "$lib/assets/about/pic2dark.webp";
    import pic3dark from "$lib/assets/about/pic3dark.webp";
    import pic4dark from "$lib/assets/about/pic4dark.webp";
    import { preferences } from "$lib/scripts/stores.svelte";
</script>

<article class="article two">
    <!-- <h2 class="gallery-title">Gallery</h2> -->
    <section class="gallery-section">
        <figure class="gallery-item">
            <img
                src={preferences.theme === "" ? pic1 : pic1dark}
                class="pic pic11"
                alt="UI desktop"
                data-nosnippet
            />
            <figcaption>UI Desktop</figcaption>
        </figure>
        <figure class="gallery-item">
            <img
                src={preferences.theme === "" ? pic2 : pic2dark}
                class="pic pic12"
                alt="UI mobile"
                data-nosnippet
            />
            <figcaption>UI Mobile</figcaption>
        </figure>
        <figure class="gallery-item">
            <img
                src={preferences.theme === "" ? pic3 : pic3dark}
                class="pic pic13"
                alt="View mode mobile"
                data-nosnippet
            />
            <figcaption>View Mode Mobile</figcaption>
        </figure>
        <figure class="gallery-item">
            <img
                src={preferences.theme === "" ? pic4 : pic4dark}
                class="pic pic14"
                alt="View mode dektop"
                data-nosnippet
            />
            <figcaption>View Mode Desktop</figcaption>
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
        border: 1px solid var(--color-border);
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
