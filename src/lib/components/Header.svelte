<script>
    import { goto } from "$app/navigation";
    import ColorScheme from "$lib/components/utils/ColorScheme.svelte";
    import LogoutButton from "$lib/components/utils/LogoutButton.svelte";
    // import helpButton from "$lib/assets/help.svg?raw";
    // import homeButton from "$lib/assets/home.svg?raw";
    import { storeSnap } from "$lib/scripts/stores";
    import { page } from "$app/stores";
    import Tools from "$lib/components/Tools.svelte";
    import { onMount } from "svelte";

    let homeButton = "";

    onMount(async () => {
        const response = await fetch("/favicon.svg");
        homeButton = await response.text();
    });

    function goHome() {
        if ($page.params?.id === "r") return;
        storeSnap();
        // $activeView = "FOLDER";
        goto("/r");
    }
</script>

<header class="header">
    <div class="title-wrapper">
        <button class="btn s-prime home" title="home" on:click={goHome}>
            {@html homeButton}
        </button>
        <button class="title-button" title="home" on:click={goHome}
            ><h1 class="title-long">Pocket Drive</h1>
            <!-- <h1 class="title-short">PD</h1> -->
        </button>
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
        gap: 2rem;
        align-items: center;
        justify-content: center;
    }
    .title-button {
        display: flex;
        align-items: center;
        justify-content: center;
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
        padding: 1rem 2.5rem;
    }
    .wrapper {
        display: flex;
        flex-flow: column;
        align-items: center;
        gap: 1rem;
    }
    .title-short,
    .title-long {
        font-size: var(--title-size);
        background: var(--title-background);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .help {
        width: var(--size-small);
    }

    .title-long {
        writing-mode: vertical-lr;
    }
    .title-short {
        display: none;
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
        .help {
            display: none;
        }

        .title-long {
            writing-mode: initial;
            /* display: none; */
        }
        .title-short {
            display: initial;
        }
        .home {
            /* display: none; */
        }
        .home :global(svg) {
            height: initial;
        }
    }
</style>
