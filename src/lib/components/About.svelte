<script lang="ts">
    import article1 from "$lib/assets/about/article1.png";
    import article12 from "$lib/assets/about/article12.png";
    import article2 from "$lib/assets/about/article2.webm";
</script>

<article class="article-1 article">
    <img src={article1} class="img1" alt="article1" />
    <div class="section">
        <img src={article12} class="img1 img12" alt="article12" />
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
    </div>
</article>
<article class="article-2 article">
    <div class="section2">
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
        <video class="img2" autoplay muted loop playsinline controls>
            <source src={article2} type="video/webm" />
        </video>
    </div>
    <div>
        <a href="https://www.linkedin.com/in/yesu4658/">developer info</a>
    </div>
</article>

<style>
    h1 {
        font-size: 4rem;
        padding-bottom: 1rem;
        margin-bottom: 1rem;
        border-bottom: 1px solid var(--primary-color);
    }

    .article {
        width: 100%;
        height: 100vh;
        scroll-snap-align: start;
        justify-items: center;
    }
    .article {
        display: flex;
        align-items: center;
        flex-flow: row wrap;
        justify-content: space-evenly;
    }
    .img1,
    .img2 {
        display: block;
        max-width: 50%;
        border: 1px solid var(--color-black-level-four);
    }
    .img12 {
        width: 30rem;
    }
    li {
        padding-bottom: 1rem;
    }
    .section,
    .section2 {
        display: flex;
        flex-flow: row nowrap;
        gap: 5rem;
        align-items: center;
        justify-content: space-evenly;
    }

    a {
        color: var(--color-link);
    }
    @media (max-width: 600px) {
        .img1,
        .img2 {
            max-width: 90%;
        }
        .img12 {
            max-width: 40%;
        }

        h1 {
            font-size: 3rem;
        }
        li {
            font-size: 1.3rem;
        }
        .section2 {
            flex-flow: column;
        }
    }
</style>
