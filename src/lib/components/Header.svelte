<script>
    import { goto } from "$app/navigation";
    import ColorScheme from "$lib/components/buttons/ColorScheme.svelte";
    import LogoutButton from "$lib/components/buttons/LogoutButton.svelte";
    import helpButton from "$lib/assets/help.svg?raw";
    import menuButton from "$lib/assets/menu.svg?raw";
    import homeButton from "$lib/assets/home.svg?raw";
    import { previewItem, shortcuts } from "$lib/scripts/stores";
    import Nav from "./Nav.svelte";

    function goHome() {
        $previewItem = undefined;
        goto("r");
    }
</script>

<header class="header">
    <div class="title-wrapper">
        <button class="btn menu">
            {@html menuButton}
        </button>
        <button class="btn home" on:click={goHome}>
            {@html homeButton}
        </button>
        <button class="title-button" on:click={goHome}
            ><h1 class="title-long">Pocket Drive</h1></button
        >
    </div>
    <!-- <button
        on:click={() => {
            $previewItem = undefined;
            goto("r", { noScroll: true });
        }}><h1 class="title">PD</h1></button
    > -->
    <div class="nav">
        <Nav />
    </div>
    <div class="wrapper">
        <button
            class="btn help"
            title="shortcuts"
            on:click={() => {
                $shortcuts = !$shortcuts;
            }}>{@html helpButton}</button
        >
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
        border-right: 1px solid var(--header-border-color);
        width: fit-content;
        height: 100vh;
        padding: 1rem 2.5rem;
        z-index: 2;
    }
    .wrapper {
        display: flex;
        flex-flow: column;
        align-items: center;
        gap: 1rem;
    }
    .title,
    .title-long {
        font-size: var(--title-size);
        background: linear-gradient(120deg, #bd34fe, #41d1ff, #473aff);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }

    .help {
        width: var(--size-small);
    }

    .title-long {
        writing-mode: sideways-lr;
    }
    .menu {
        display: none;
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
            border-bottom: 1px solid var(--header-border-color);
            /* display: none; */
        }
        .wrapper {
            flex-flow: row nowrap;
            justify-content: end;
            gap: 2rem;
        }
        .nav {
            display: none;
        }
        .help {
            display: none;
        }
        .title {
            display: none;
        }
        .menu,
        .title-long {
            display: initial;
        }
        .title-long {
            writing-mode: initial;
        }
        .home {
            display: none;
        }
    }
</style>
