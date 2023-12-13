<script>
    import ColorScheme from "$lib/components/buttons/ColorScheme.svelte";
    import LoginButton from "$lib/components/buttons/LoginButton.svelte";
    import { navigating } from "$app/stores";
    import LoadIndicator from "$lib/components/actions/LoadIndicator.svelte";
    import About from "$lib/components/About.svelte";
    import helpIcon from "$lib/assets/help.svg?raw";
</script>

{#if $navigating}
    <div class="loading">
        <LoadIndicator />
    </div>
{:else}
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
                <!-- <div class="bg"></div> -->
                <h1 class="home-title">Pocket Drive</h1>
                <p class="sub">
                    A google drive based image & bookmark application
                </p>
            </section>
        </article>
        <About />
    </main>
{/if}

<style>
    .article {
        position: relative;
        width: 100%;
        height: 100vh;
        scroll-snap-align: end;
    }
    .home {
        padding: 1rem;
        height: 100vh;
        overflow-y: scroll;
        scroll-snap-type: y mandatory;
        scroll-behavior: smooth;
    }

    .header {
        position: absolute;
        padding: 2rem;
        top: 10rem;
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
    .bg {
        width: 100%;
        height: 500px;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-image: linear-gradient(30deg, #bd34fe 50%, #41d1ff 50%);
        filter: blur(100px);
    }

    .home-title {
        font-weight: 900;
        font-size: 10rem;
        background: linear-gradient(120deg, #bd34fe, #41d1ff, #473aff);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .sub {
        text-align: center;
        padding-top: 1rem;
        font-size: var(--size-small);
        /* color: #41d1ff; */
        background: linear-gradient(-45deg, #bd34fe, #41d1ff);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
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
        /* .signin {
            width: var(--size-large);
        } */
        .home-title {
            font-size: 10vw;
            width: fit-content;
        }
        .sub {
            font-size: 1.3rem;
        }
    }
</style>
