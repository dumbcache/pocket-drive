<script>
    import ColorScheme from "$lib/components/utils/ColorScheme.svelte";
    import LogoutButton from "$lib/components/utils/LogoutButton.svelte";
    import { HOME_PATH } from "$lib/scripts/stores";
    import Tools from "$lib/components/Tools.svelte";
    import { onMount } from "svelte";
    import BackButton from "./utils/BackButton.svelte";

    let homeButton = "";

    onMount(async () => {
        const response = await fetch("/favicon.svg");
        homeButton = await response.text();
    });
</script>

<header class="header">
    <div class="title-wrapper">
        <BackButton />
        <a href={HOME_PATH} class="title-button">
            <span class="btn s-prime home" title="home">
                {@html homeButton}
            </span>
            <h1 class="title">Pocket Drive</h1>
        </a>
    </div>
    <div class="tool-wrapper">
        <Tools />
    </div>
    <div class="wrapper">
        <!-- <button class="btn help" title="shortcuts" on:click={() => {}}
            >{@html helpButton}</button
        > -->
        <ColorScheme />
        <LogoutButton />
    </div>
</header>

<style>
    .title-wrapper {
        display: flex;
        flex-flow: column;
        gap: 1rem;
        align-items: center;
        justify-content: center;
    }
    .title-button {
        display: flex;
        flex-flow: column nowrap;
        align-items: center;
        justify-content: center;
        gap: 2rem;
    }

    .title {
        writing-mode: vertical-lr;
        font-family: var(--font-lato);
        /* display: none; */
    }

    .title-wrapper :global(.back-button) {
        display: none;
    }

    .header {
        position: sticky;
        top: 0;
        display: flex;
        flex-flow: column nowrap;
        justify-content: space-between;
        align-items: center;
        border-right: 1px solid var(--color-file-border);
        width: fit-content;
        height: 100vh;
        padding: 1rem 4rem;
    }
    .wrapper {
        display: flex;
        flex-flow: column;
        align-items: center;
        gap: 1rem;
    }
    .title {
        font-size: var(--title-size);
        background: var(--title-background);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .home :global(svg) {
        width: 5rem;
        height: 5rem;
    }
    @media (max-width: 600px) {
        .title-wrapper {
            flex-flow: row nowrap;
        }
        .header {
            position: relative;
            height: initial;
            width: initial;
            flex-flow: row nowrap;
            padding: 1rem 1rem;
            border-right: none;
            border-bottom: 1px solid var(--color-file-border);
        }
        .wrapper {
            flex-flow: row nowrap;
            justify-content: end;
            gap: 2rem;
        }
        .tool-wrapper {
            display: none;
        }

        .title-wrapper {
            gap: 3rem;
        }
        .title-button {
            flex-flow: row wrap;
            gap: 0.5rem;
        }
        .title {
            writing-mode: initial;
            display: initial;
        }
        .title-wrapper :global(.back-button) {
            display: initial;
        }
        .home :global(svg) {
            height: initial;
        }
    }
</style>
