<article class="article three">
    <section class="features">
        <h2>Key Features</h2>
        <ul>
            <!-- <li>Bookmark URLs effortlessly</li> -->
            <li>Image bookmarking</li>
            <li>View mode and Edit mode</li>
            <!-- <li>Toggle between editing modes</li> -->
            <li>Drag and drop upload</li>
            <li>Folder searching</li>
        </ul>
    </section>

    <section class="design">
        <h2>Design</h2>
        <ul>
            <li>Sleek and minimalist design</li>
            <li>Optimized for mobile devices</li>
            <li>No server-side logic; fully client-side operation</li>
            <li>Respect for privacy: no user data storage or tracking</li>
        </ul>
    </section>

    <section class="technical">
        <h2>Technical Details</h2>
        <ul>
            <li>Google OAuth for secure user authentication</li>
            <li>Google Drive for storage</li>
            <li>Browser caching and workers for improved performance</li>
            <li>Progressive Web App (PWA) support</li>
            <li>WebP by default for reduced size and better quality</li>
        </ul>
    </section>
</article>

<style>
    .three {
        display: flex;
        flex-flow: row wrap;
        justify-content: center;
        gap: 5rem;
        font-size: var(--size-smaller);
    }

    h2 {
        font-size: var(--size-medium);
        font-weight: 900;
        padding-bottom: 2rem;
    }
    li {
        padding: 1rem;
        border-left: 5px solid var(--color-focus);
        margin-bottom: 0.5rem;
    }

    section {
        width: 40rem;
    }
    @media (max-width: 800px) {
        section {
            width: 100%;
        }
    }

    @media (max-width: 600px) {
        section {
            font-size: var(--size-smallest);
        }
        li {
            padding: 0.5rem;
        }
    }
</style>
