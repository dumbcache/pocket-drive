<script lang="ts">
    import article1 from "$lib/assets/about/article1.png";
    import article12 from "$lib/assets/about/article12.png";
    import article13 from "$lib/assets/about/article13.png";
    import article14 from "$lib/assets/about/article14.png";
    import article15 from "$lib/assets/about/article15.png";
    import svelteIcon from "$lib/assets/svelteIcon.svg?raw";
    import githubIcon from "$lib/assets/githubIcon.svg?raw";
    import linkedinIcon from "$lib/assets/linkedinIcon.svg?raw";
    import emailIcon from "$lib/assets/emailIcon.svg?raw";
</script>

<article class="article-1 article">
    <section class="gallery">
        <img src={article1} class="img img11" alt="UI desktop" />
        <img src={article12} class="img img12" alt="UI mobile" />
        <img src={article14} class="img img14" alt="View mode mobile" />
        <img src={article13} class="img img13" alt="View mode desktop" />
        <img src={article15} class="img img15" alt="Edit mode desktop" />
    </section>
    <!-- <div class="section">
        <div>
            <h1>Design</h1>
            <ul>
                <li>Clean l ooking and simplified</li>
                <li>Mobile friendly</li>
                <li>No Server logic</li>
                <li>Uses Google oauth for login</li>
                <li>Does not store or track user data</li>
                <li>Everything runs in browser</li>
            </ul>
        </div>
    </div> -->
</article>
<article class="article-2 article">
    <!-- <div class="section2">
        <div>
            <h1>Features</h1>
            <ul>
                <li>Add URL's to images for easy bookmarking</li>
                <li>Favourite your images for easy filter</li>
                <li>Edit mode to easily update, move and delete</li>
                <li>Upload images by dropping</li>
                <li>Easy folder searching</li>
            </ul>
        </div>
    </div> -->
    <div></div>
</article>
<footer class=""></footer>

<footer class="footer-wrapper developer-info section">
    <p class="alt">
        Develped by <a href="https://www.linkedin.com/in/dumbcache/">Yesu G</a>
        <small>(MySelf)</small>
        using
        <a href="https://kit.svelte.dev/" title="svelte kit" class="svelte-icon"
            >{@html svelteIcon}</a
        >
    </p>
    <section class="social">
        <a href="https://github.com/dumbcache/">{@html githubIcon}</a>
        <a href="https://www.linkedin.com/in/dumbcache/">{@html linkedinIcon}</a
        >
        <a href="mailto:dumbcache@gmail.com">
            {@html emailIcon}
        </a>
    </section>
    <!-- <a >developer info</a> -->
</footer>

<style>
    .gallery {
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        justify-content: space-evenly;
        padding: 4rem 2rem;
        gap: 5rem 2rem;
    }
    .img {
        max-width: 100%;
        max-height: 40rem;
        object-fit: contain;
        border: 1px solid var(--color-file-border);
    }

    .developer-info {
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 0rem;
        gap: 1rem;
        border-top: 1px solid var(--color-file-border);
        text-align: center;
        font-size: 1.5rem;
    }
    .alt * {
        display: inline-block;
    }

    small {
        font-size: xx-small;
    }
    a,
    a:hover {
        color: var(--color-focus);
    }
    .svelte-icon {
        vertical-align: middle;
        max-width: 3rem;
    }

    a {
        color: red;
    }
    .social {
        display: flex;
        align-items: center;
        gap: 1rem;
    }
    .social a {
        display: inline-block;
        width: 4rem;
    }
    :global(svg) {
        fill: var(--primary-color);
    }
    :global(svg):hover {
        fill: var(--color-focus);
    }

    @media (max-width: 600px) {
        .gallery {
            justify-content: center;
            gap: 2rem;
        }
        .img {
            max-height: 30rem;
        }
        .developer-info {
            padding: 2rem 1rem;
        }
        .social a {
            width: 3rem;
        }

        .alt {
            width: 100vw;
            font-size: 1.3rem;
        }
    }
</style>
