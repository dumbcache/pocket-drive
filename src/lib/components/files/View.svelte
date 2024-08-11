<script lang="ts">
    import ViewInfo from "$lib/components/files/ViewInfo.svelte";
    import ViewNav from "$lib/components/files/ViewNav.svelte";
    import ViewTools from "./ViewTools.svelte";
    import ViewDisplay from "./ViewDisplay.svelte";
    import { fileStore } from "$lib/scripts/stores.svelte";

    let infoVisible = $state(false);
    let zoom = $state(false);
    let expand = $state(false);
    let fileMap = new Map<string,DriveFile>();
    let previewElements = new Map<string, HTMLElement>();
    let navigationElements = new Map<string, HTMLElement>();

    const toggleInfo = () => (infoVisible = !infoVisible);
    const toggleZoom = () => (zoom = !zoom);
    const toggleExpand = () => (expand = !expand);

    fileStore.files.forEach((f) => fileMap.set(f.id, f));
</script>

<div class="view-container" onwheel={(e) => e.preventDefault()}>
    <!-- svelte-ignore a11y_no_noninteractive_tabindex -->
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <artcle
        tabindex="0"
        id="view"
        role="dialog"
        ondragstart={(e:DragEvent) => e.preventDefault()}
        onwheel={(e:WheelEvent) => {
            zoom || e.preventDefault();
        }}
    >
        <ViewNav {expand} {fileMap} {previewElements} {navigationElements}/>
        <ViewDisplay {zoom} {fileMap} {previewElements}/>
        {#if infoVisible}
            <ViewInfo {toggleInfo} />
        {/if}
    </artcle>

    <ViewTools {toggleExpand} {toggleZoom} {toggleInfo} {zoom} {expand} />
</div>

<style>
    .view-container {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        z-index: 5;
        background-color: #12121205;
        backdrop-filter: blur(50px);
        -webkit-backdrop-filter: blur(50px);
        /* background-color: var(--color-backdrop); */
    }

    #view {
        box-sizing: border-box;
        height: 100%;
        padding: 3rem 6rem;
        outline: none;
        display: flex;
        flex-flow: row nowrap;
        gap: 5rem;
    }
    #view :global(section) {
        height: 100%;
    }
    #view :global(.one) {
        min-width: 15rem;
        max-width: 20rem;
        overflow: auto;
        scroll-behavior: smooth;
    }
    #view :global(.two) {
        margin: auto;
        max-width: 100%;
        min-width: 50%;
        overflow-y: hidden;
        overflow-x: scroll;
        display: flex;
        gap: 5rem;
        flex-flow: row nowrap;
        scroll-snap-type: x mandatory;
        scroll-behavior: smooth;
    }

    #view :global(.three) {
        position: absolute;
        min-width: 30rem;
        right: 0;
        top: 0;
        z-index: 1;
    }

    @media (max-width: 600px) and (orientation: portrait) {
        #view {
            flex-flow: column-reverse;
            padding: 0rem;
            padding-bottom: 0.5rem;
            gap: 1rem;
        }
        #view :global(.one) {
            max-width: 100%;
            /* margin: auto; */
            min-height: 10%;
            max-height: 10%;
            padding: 0.5rem 1rem;
            overflow: hidden;
        }

        #view :global(.two) {
            min-height: 85%;
            max-height: 85%;
            min-width: 100%;
        }

        #view :global(.three) {
            min-width: 100%;
            height: 100%;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            margin: auto;
            position: absolute;
            z-index: 11;
        }
    }
    @media (max-width: 600px) and (orientation: landscape) {
        #view {
            padding: 2.5rem;
        }
    }
</style>
