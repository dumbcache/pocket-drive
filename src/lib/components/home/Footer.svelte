<script>
    import githubIcon from "$lib/assets/githubIcon.svg?raw";
    import linkedinIcon from "$lib/assets/linkedinIcon.svg?raw";
    import emailIcon from "$lib/assets/emailIcon.svg?raw";
</script>

<footer class="footer-wrapper developer-info section">
    <h2 class="alt">
        Developer info - <a href="https://www.linkedin.com/in/dumbcache/"
            >Dumbcache</a
        >
    </h2>
    <section class="social">
        <a
            href="https://github.com/dumbcache/"
            class="btn s-prime"
            title="Visit Dumbcache's GitHub profile">{@html githubIcon}</a
        >
        <a
            href="https://www.linkedin.com/in/dumbcache/"
            class="btn s-prime"
            title="Visit Dumbcache's LinkedIn profile">{@html linkedinIcon}</a
        >
        <a
            href="mailto:dumbcache@gmail.com"
            class="btn s-prime"
            title="Send an email to Dumbcache"
        >
            {@html emailIcon}
        </a>
    </section>
    <!-- <a >developer info</a> -->
</footer>

<style>
    .developer-info {
        display: flex;
        flex-flow: column;
        align-items: center;
        justify-content: center;
        padding: 3rem 0rem;
        gap: 1rem;
        border-top: 1px solid var(--color-lite);
        text-align: center;
        font-size: var(--size-smaller);
    }

    .social {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    a {
        /* text-decoration: underline; */
        color: var(--color-focus);
    }
    @media (max-width: 600px) {
        .developer-info {
            padding: 2rem 1rem;
            font-size: var(--size-smallest);
        }
    }
</style>
