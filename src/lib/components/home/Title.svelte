<script>
    import ColorScheme from "$lib/components/profile/ColorScheme.svelte";
    import LoginButton from "$lib/components/profile/LoginButton.svelte";
</script>

<article class="article one">
    <header class="header">
        <ColorScheme />
        <LoginButton />
    </header>
    <section class="section">
        <h1 class="title">Pocket Drive</h1>
        <p class="sub">A google drive based image & bookmark application</p>
    </section>
</article>

<style>
    .one {
        height: 100vh;
        position: relative;
        display: grid;
        place-content: center;
    }
    .header {
        position: absolute;
        top: 10vh;
        right: 15rem;
        display: flex;
        align-items: center;
        gap: 3rem;
    }

    .title {
        width: fit-content;
        margin: auto;
        font-size: 8rem;
        /* font-weight: 900; */
        font-family: var(--font-comic);
        background: var(--title-background);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .sub {
        width: fit-content;
        margin: auto;
        font-size: 1.6rem;
        font-family: var(--font-lato);
        padding-top: 1rem;
        background: var(--title-background);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    @media (max-width: 600px) {
        .header {
            right: 2rem;
            gap: 2rem;
        }

        .title {
            font-size: 15vw;
        }
        .sub {
            font-size: 1.3rem;
        }
    }
</style>
