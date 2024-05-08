<script lang="ts">
    import article1 from "$lib/assets/about/article1.png";
    import article12 from "$lib/assets/about/article12.png";
    import article13 from "$lib/assets/about/article13.png";
    import article14 from "$lib/assets/about/article14.png";
    import article15 from "$lib/assets/about/article15.png";
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
    <div>
        <a href="https://www.linkedin.com/in/dumbcache/">developer info</a>
    </div>
</article>

<style>
    .gallery {
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        justify-content: space-evenly;
        padding: 2rem;
        gap: 2rem;
    }
    .img {
        max-width: 100%;
        max-height: 40rem;
        object-fit: contain;
    }

    @media (max-width: 600px) {
        .gallery {
            justify-content: center;
        }
        .img {
            max-height: 30rem;
        }
    }
</style>
