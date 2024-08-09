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
    import FolderTitle from "$lib/components/utils/FolderTitle.svelte";
    import Help from "$lib/components/header/Help.svelte";
    import Crumbs from "$lib/components/header/Crumbs.svelte";
    import Search from "$lib/components/header/Search.svelte";
</script>

<header>
    <!-- <BackButton /> -->
    <section class="one">
        <a class="title" href={HOME_PATH}>
            <span class="icon">
                <HomeIcon />
            </span>
            <span class="text">ocket Drive</span>
        </a>
        <div class="crumbs">
            <Crumbs />
        </div>
    </section>
    <!-- <Count
        count={states.view === "FOLDER"
            ? folderStore.files.length
            : fileStore.files.length}
    /> -->
    <!-- <section class="search">
        <Search />
    </section> -->
    <section class="two">
        <Help />
    </section>
</header>

<style>
    header {
        position: sticky;
        top: 0;
        display: flex;
        flex-flow: row wrap;
        align-items: center;
        justify-content: space-between;
        gap: 5rem;
        padding: 2rem;
        /* border-bottom: 1px solid var(--color-border); */
        /* background-color: #000; */
        z-index: 1;
        background: inherit;
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
        /* display: none; */
    }
    .one {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: 20rem;
        /* align-self: end; */
    }
    .search {
        max-width: 50rem;
        flex-grow: 1;
    }
    @media (max-width: 900px) {
        .one {
            gap: 10rem;
        }
    }
    @media (max-width: 600px) {
        header {
            position: unset;
            padding: 1rem 0.5rem;
            gap: 1rem;
        }
        .icon {
            width: 2.4rem;
            height: 2.4rem;
        }
        .one {
            gap: 1rem;
        }

        .crumbs {
            display: none;
        }
    }
</style>
