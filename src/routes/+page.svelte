<script>
    import ColorScheme from "$lib/components/actions/ColorScheme.svelte";
    import { navigating } from "$app/stores";
    import LoadIndicator from "$lib/components/actions/LoadIndicator.svelte";
    import { getOauthToken } from "$lib/scripts/utils";
    import googleIcon from "$lib/assets/google.png";
    import { loadGSIScript } from "$lib/scripts/utils";
    import { onMount } from "svelte";
    import About from "$lib/components/About.svelte";

    // console.log($isLoggedin);
    onMount(() => {
        try {
            loadGSIScript();
        } catch (error) {
            console.warn(error);
        }
    });
</script>

{#if $navigating}
    <div class="loading">
        <LoadIndicator />
    </div>
{:else}
    <div class="home">
        <div class="article">
            <header class="header">
                <a href="#info">Info</a>
                <ColorScheme />
                <button on:click={getOauthToken} class="signin"
                    ><img src={googleIcon} alt="signin" /></button
                >
            </header>
            <div class="title-wrapper">
                <h1 class="home-title">Pocket Drive</h1>
                <p class="sub">
                    A google drive based image & bookmark application
                </p>
            </div>
        </div>
        <div id="info" />
        <About />
    </div>
{/if}

<style>
    .article {
        width: 100%;
        height: 100vh;
        scroll-snap-align: start;
    }
    .home {
        height: 100vh;
        overflow-y: scroll;
        scroll-snap-type: y mandatory;
        scroll-behavior: smooth;
    }

    .header {
        width: fit-content;
        margin-left: auto;
        padding: 2rem;
        display: flex;
        align-items: center;
        gap: 3rem;
    }
    .signin {
        width: var(--size-large);
        background-color: white;
        border-radius: 50%;
        display: flex;
        align-items: center;
        cursor: pointer;
        filter: none;
        border: 1px solid #1115;
    }
    .signin:hover {
        background-color: #fffc;
    }
    .home-title {
        font-weight: 900;
        font-size: 10rem;
    }
    .title-wrapper {
        display: grid;
        place-content: center;
        height: calc(100vh - 7rem);
    }
    .sub {
        text-align: center;
        padding-top: 1rem;
    }
    .loading {
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
    }
    @media (max-width: 600px) {
        .header {
            gap: 2rem;
        }
        /* .signin {
            width: var(--size-large);
        } */
        .home-title {
            font-size: 5rem;
        }
    }
</style>
