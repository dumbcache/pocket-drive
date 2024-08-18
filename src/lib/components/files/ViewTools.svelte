<script lang="ts">
    import closeIcon from "$lib/assets/close.svg?raw";
    import infoIcon from "$lib/assets/arrowLeftDouble.svg?raw";
    import zoomInIcon from "$lib/assets/zoomIn.svg?raw";
    import zoomOutIcon from "$lib/assets/zoomOut.svg?raw";
    import expandIcon from "$lib/assets/expand.svg?raw";
    import downloadIcon from "$lib/assets/download.svg?raw";
    import urlIcon from "$lib/assets/url.svg?raw";
    import { states, tempStore } from "$lib/scripts/stores.svelte";
    import Favorite from "$lib/components/utils/Favorite.svelte";

    let {
        zoom,
        expand,
        toggleInfo,
        toggleZoom,
        toggleExpand,
    }: {
        zoom: boolean;
        expand: boolean;
        toggleInfo: MouseEventHandler<HTMLButtonElement>;
        toggleZoom: MouseEventHandler<HTMLButtonElement>;
        toggleExpand: MouseEventHandler<HTMLButtonElement>;
    } = $props();

    async function toggleFav(id: string) {
        tempStore.activeFile.starred = !tempStore.activeFile.starred;
    }
</script>

<div class="action" class:expanded={expand}>
    {#if tempStore.activeFile?.download}
        <a
            href={tempStore.activeFile.download}
            download={tempStore.activeFile.name}
            class="btn s-prime"
            target="_blank"
            rel="noopener noreferrer"
            title="download">{@html downloadIcon}</a
        >
    {/if}
    {#if tempStore.activeFile?.description}
        <a
            title="go to website"
            href={tempStore.activeFile.description}
            class="btn s-second url">{@html urlIcon}</a
        >
    {/if}
    <Favorite
        id={tempStore.activeFile.id}
        starred={tempStore.activeFile.starred}
        toggle={() => toggleFav(tempStore.activeFile.id)}
    />
    <button
        class="btn s-prime"
        title="zoom"
        onclick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleZoom();
        }}>{@html zoom ? zoomOutIcon : zoomInIcon}</button
    >
    <button class="btn s-prime info" title="info" onclick={toggleInfo}
        >{@html infoIcon}</button
    >
    <button
        class="btn s-prime expand"
        title="expand"
        onclick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleExpand();
        }}>{@html expandIcon}</button
    >
</div>

<button class="btn s-prime close" onclick={() => (states.mode = "")}
    >{@html closeIcon}</button
>

<style>
    .action {
        display: flex;
        flex-flow: column-reverse nowrap;
        justify-content: center;
        align-items: center;
        position: fixed;
        top: 2rem;
        right: 2rem;
        gap: 1.5rem;
    }

    .expand {
        display: none;
    }
    .close {
        position: absolute;
        top: 2rem;
        left: 2rem;
        z-index: 10;
    }

    @media (max-width: 600px) and (orientation: portrait) {
        .action {
            bottom: 5.5rem;
            top: unset;
            right: 2rem;
            flex-flow: row nowrap;
        }

        .expanded {
            bottom: 0rem;
        }
        .expand {
            display: initial;
        }
        .info {
            rotate: 90deg;
        }
        .close {
            top: 0rem;
            left: 0rem;
            box-sizing: content-box;
            padding: 0.5rem;
        }
    }
</style>
