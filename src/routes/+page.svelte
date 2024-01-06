<script>
    import ColorScheme from "$lib/components/buttons/ColorScheme.svelte";
    import LoginButton from "$lib/components/buttons/LoginButton.svelte";
    import helpIcon from "$lib/assets/help.svg?raw";
</script>

<main class="home">
    <article class="article">
        <header class="header">
            <a href="/help" class="help" title="Go to help"
                ><span>
                    {@html helpIcon}
                </span>Help</a
            >
            <ColorScheme />
            <LoginButton />
        </header>
        <section class="title-wrapper">
            <h1 class="home-title">Pocket Drive</h1>
            <p class="sub">A google drive based image & bookmark application</p>
        </section>
    </article>
</main>

<style>
    .article {
        position: relative;
        width: 100%;
        scroll-snap-align: end;
    }
    .home {
        overflow-y: scroll;
        scroll-snap-type: y mandatory;
        scroll-behavior: smooth;
    }

    .header {
        position: absolute;
        padding: 2rem;
        top: 10vh;
        right: 15rem;
        width: fit-content;
        margin-left: auto;
        display: flex;
        align-items: center;
        gap: 3rem;
    }
    .help {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
    }
    .help span {
        height: 1.6rem;
        width: 1.6rem;
    }
    span :global(svg) {
        fill: var(--color-link);
    }
    .title-wrapper {
        display: grid;
        place-content: center;
        justify-items: center;
        height: 100vh;
    }

    .home-title {
        font-weight: 900;
        font-size: 10rem;
        background: var(--title-background);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .sub {
        padding-top: 1rem;
        font-size: var(--size-small);
        background: var(--title-background);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    a {
        color: var(--color-link);
        text-decoration: none;
        position: relative;
    }
    a:hover {
        font-size: 1.65rem;
        text-decoration: underline;
    }

    @media (max-width: 900px) {
        .header {
            right: 2rem;
            gap: 2rem;
        }

        .home-title {
            font-size: 10vw;
            width: fit-content;
        }
        .sub {
            font-size: 1.3rem;
        }
    }
</style>
