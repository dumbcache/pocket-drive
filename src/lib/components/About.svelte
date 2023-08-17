<script lang="ts">
    import article1 from "$lib/assets/about/article1.png";
    import article12 from "$lib/assets/about/article12.png";
    import article2 from "$lib/assets/about/article2.webm";
</script>

<article class="article-1 article">
    <img src={article1} class="img1" alt="article1" />
    <img src={article12} class="img1 img12" alt="article12" />
    <div>
        <h1>Design</h1>
        <ul>
            <li>Clean looking and Simplified</li>
            <li>Mobile friendly</li>
        </ul>
    </div>
</article>
<article class="article-2 article">
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
    <video class="img2" autoplay muted loop>
        <source src={article2} type="video/webm" />
    </video>
</article>
<article id="#help" class="article article3">
    <ul>
        <li>Google account is necessary</li>
        <li>App stores data in google drive</li>
        <li>Does not store or track user data</li>
        <li>Use the application with click of a button</li>
    </ul>
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
    }
    .article {
        display: flex;
        align-items: center;
        justify-content: space-evenly;
    }
    .img1,
    .img2 {
        display: block;
        width: 50%;
        border: 1px solid var(--color-black-level-four);
    }
    .img12 {
        width: 30rem;
    }
    li {
        font-size: 2rem;
        /* list-style-type: none; */
        padding-bottom: 1rem;
    }
</style>
