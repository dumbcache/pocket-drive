<script>
    import BackButton from "$lib/components/utils/BackButton.svelte";
    import HomeIcon from "$lib/components/HomeIcon.svelte";
    import Count from "$lib/components/utils/Count.svelte";
    import {
        fileStore,
        folderStore,
        HOME_PATH,
        states,
    } from "$lib/scripts/stores.svelte";
    import Help from "$lib/components/header/Help.svelte";
    import Crumbs from "$lib/components/header/Crumbs.svelte";
    import Tools from "$lib/components/header/Tools.svelte";
</script>

<header>
    <section class="one">
        <div class="title-wrapper">
            <a class="title" href={HOME_PATH}>
                <span class="icon">
                    <HomeIcon />
                </span>
                <span class="text">ocket Drive</span>
            </a>
            <div class="crumbs">
                <Crumbs />
            </div>
        </div>
        <div class="util-wrapper">
            <Help />
        </div>
    </section>
    {#if states.mode !== "EDIT"}
        <section class="two">
            <div class="tool-wrapper">
                <div class="tools">
                    <Tools />
                </div>
                <!-- {#if states.mode !== "SEARCH"} -->
                <div class="count">
                    <Count
                        count={states.view === "FOLDER"
                            ? folderStore.files.length
                            : fileStore.files.length}
                    />
                </div>
                <!-- {/if} -->

                <div class="back">
                    <BackButton />
                </div>
            </div>
            <div class="crumb-wrapper">
                <BackButton />
                <span>
                    <Crumbs />
                </span>
            </div>
        </section>
    {/if}
</header>

<style>
    header {
        display: flex;
        flex-flow: column;
        position: sticky;
        top: 0;
        padding: 3rem 2rem;
        /* border-bottom: 1px solid var(--color-border); */
        /* background-color: #000; */
        z-index: 1;
        background: var(--color-bg);
    }
    .one {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }

    .title-wrapper {
        display: flex;
        gap: 10rem;
        align-items: center;
    }

    .icon {
        width: 3rem;
        height: 3rem;
    }

    .title {
        display: flex;
        align-items: center;
        font-size: var(--title-size);
        background: var(--title-background);
        background-clip: text;
        -webkit-text-fill-color: transparent;
    }
    .text {
        margin-left: -0.3rem;
    }

    .crumb-wrapper {
        display: none;
    }

    .tools {
        position: fixed;
        top: 50%;
        left: 0;
        transform: translate(0%, -50%);
        padding: 2rem;
        z-index: 1;
    }

    .count {
        position: fixed;
        right: 0;
        top: 10rem;
        z-index: 1;
    }
    .back {
        position: fixed;
        top: 11rem;
        left: 2rem;
        z-index: 1;
    }

    @media (max-width: 900px) {
        .title-wrapper {
            gap: 2rem;
        }
    }

    @media (max-width: 600px) {
        header {
            padding: 1rem 0.5rem;
            gap: 1rem;
        }

        .back {
            display: none;
        }

        .two {
            background-color: inherit;
            padding-top: 1rem;
        }

        .icon {
            width: 2.4rem;
            height: 2.4rem;
        }
        .tools,
        .count {
            position: initial;
            transform: initial;
            padding: 0rem;
        }

        .crumbs {
            display: none;
        }
        .tool-wrapper {
            display: flex;
            justify-content: space-between;
            align-items: center;
        }

        .crumb-wrapper {
            padding-top: 1.5rem;
            display: flex;
            align-items: center;
            gap: 0.5rem;
        }

        .crumb-wrapper span {
            margin: auto;
        }
    }
</style>
