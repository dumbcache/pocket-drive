<script lang="ts">
    import closeIcon from "$lib/assets/close.svg?raw";
    import infoIcon from "$lib/assets/arrowLeftDouble.svg?raw";
    import zoomInIcon from "$lib/assets/zoomIn.svg?raw";
    import zoomOutIcon from "$lib/assets/zoomOut.svg?raw";
    import expandIcon from "$lib/assets/expand.svg?raw";
    import downloadIcon from "$lib/assets/download.svg?raw";
    import urlIcon from "$lib/assets/url.svg?raw";
    import { imageCache, states, tempStore } from "$lib/scripts/stores.svelte";
    import Favorite from "$lib/components/utils/Favorite.svelte";
    import refreshIcon from "$lib/assets/refresh.svg?raw";
    import { fetchImgPreview } from "$lib/scripts/utils";

    let {
        zoom,
        expand,
        hidden,
        toggleInfo,
        toggleZoom,
        toggleExpand,
    }: {
        zoom: boolean;
        expand: boolean;
        hidden: boolean;
        toggleInfo: MouseEventHandler<HTMLButtonElement>;
        toggleZoom: MouseEventHandler<HTMLButtonElement>;
        toggleExpand: MouseEventHandler<HTMLButtonElement>;
    } = $props();

    async function refreshHandler() {
        let id = tempStore.activeFile.id;
        if (imageCache.has(id)) {
            imageCache.delete(id);
        }
        tempStore.activeFile.loading = true;
        fetchImgPreview(id);
    }

    async function toggleFav(id: string) {
        tempStore.activeFile.starred = !tempStore.activeFile.starred;
    }
</script>

<div
    class="action"
    class:expanded={expand}
    style:display={hidden ? "none" : "flex"}
>
    <button class="btn s-second" title="refresh" onclick={refreshHandler}>
        {@html refreshIcon}
    </button>
    {#if tempStore.activeFile?.download}
        <a
            href={tempStore.activeFile.download}
            download={tempStore.activeFile.name}
            class="btn s-second"
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
        stroke="var(--color-svg)"
        strokeWidth={60}
        fill={"none"}
    />
    <button
        class="btn s-second"
        title="zoom"
        onclick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleZoom();
        }}>{@html zoom ? zoomOutIcon : zoomInIcon}</button
    >
    <button class="btn s-second info" title="info" onclick={toggleInfo}
        >{@html infoIcon}</button
    >
    <button
        class="btn s-second expand"
        title="expand"
        onclick={(e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleExpand();
        }}>{@html expandIcon}</button
    >
</div>

<button
    class="btn s-second close"
    onclick={() => {
        states.mode = "";
        history.back();
    }}
    style:display={hidden ? "none" : "flex"}>{@html closeIcon}</button
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
        position: fixed;
        top: 2rem;
        left: 2rem;
        z-index: 10;
    }

    @media (max-width: 600px) and (orientation: portrait) {
        .expand {
            display: initial;
        }
        .info {
            rotate: 90deg;
        }
        .action {
            bottom: 8rem;
            top: unset;
            right: 2rem;
            flex-flow: row nowrap;
            padding: 0.5rem;
        }
        .close {
            top: 0.5rem;
            left: 0.5rem;
            box-sizing: content-box;
            padding: 0.5rem;
        }

        .expanded {
            bottom: 0.5rem;
        }
        .action,
        .close {
            background: var(--color-bg);
            backdrop-filter: blur(10px);
            border-radius: 2.5rem;
        }
    }
    @media (max-width: 330px) and (orientation: portrait) {
        .action {
            bottom: 5.5rem;
        }
    }
</style>
