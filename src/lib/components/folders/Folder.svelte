<script lang="ts">
    import { goto } from "$app/navigation";
    import FolderCover from "$lib/components/folders/FolderCover.svelte";
    import { IMG_MIME_TYPE, fetchMultiple, getToken } from "$lib/scripts/utils";
    import Favorite from "../utils/Favorite.svelte";

    export let visible: Boolean;
    export let toolsVisible: Boolean = true;
    export let folder: Folder;

    let timeout: number;
    let peakElement: HTMLDivElement;
    let files: GoogleFile[] = [];

    function displayPeak(e: MouseEvent) {
        timeout = setTimeout(async () => {
            const fileRes = await fetchMultiple(
                { parent: folder.id, mimeType: IMG_MIME_TYPE },
                getToken()
            );
            files = fileRes.files;
            if (files.length === 0) return;
            // let x = e.clientX;
            // let y = e.clientY;
            // if (x + 500 > window.innerWidth) {
            //     x = window.innerWidth - peakElement.offsetWidth;
            //     peakElement.style.left = `${x}px`;
            //     peakElement.style.right = `unset`;
            // }
            // if (y + peakElement.offsetHeight > window.innerHeight) {
            //     y = window.innerHeight - peakElement.offsetHeight;
            //     peakElement.style.top = `${y}px`;
            // }
            document.querySelector(".peak").style.display = "none";
            peakElement.style.display = "initial";
            peakElement.onmouseover = () => peakElement.parentElement?.focus();
        }, 1000);
    }
    function closePeak() {
        clearTimeout(timeout);
        peakElement.style.display = "none";
    }
</script>

<div
    class="card"
    role="listitem"
    on:dragstart|preventDefault
    data-id={folder.id}
>
    <!-- on:mouseleave={closePeak}
    on:mouseenter={displayPeak} -->
    <FolderCover
        id={folder.id}
        name={folder.name}
        starred={folder.starred}
        {toolsVisible}
        {visible}
    />
    <div class="title-wrapper">
        <h2 class="folder-title" title={folder.name}>{folder.name}</h2>
        <div class="favorite">
            <Favorite
                id={folder.id}
                starred={folder.starred}
                on:fav={() => (folder.starred = !folder.starred)}
            />
        </div>
    </div>

    <!-- <div
        class="peak"
        bind:this={peakElement}
        on:mouseenter={() => (hover = true)}
        on:mouseleave={() => (hover = false)}
    >
        <FolderPeak {files} />
    </div> -->
</div>

<style>
    .card {
        position: relative;
    }
    .card:hover {
        /* box-shadow: 0 0 2px 2px var(--color-focus); */
        transform: scale(1.01);
    }

    .peak {
        position: absolute;
        display: none;
        right: 50%;
        top: 50%;
        z-index: 1;
        width: 50rem;
        max-height: 50rem;
        background-color: var(--primary-bg-color);
        /* border: 1px solid var(--color-focus); */
        box-shadow: 0 0 50px 5px #000;
        border-radius: 0.5rem;
        overflow-y: hidden;
        padding: 2rem 1rem;
        filter: none;
    }

    .card {
        width: var(--folder-width);
    }
    .folder-title {
        word-wrap: unset;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
    .title-wrapper {
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        justify-content: space-between;
        gap: 1rem;
        padding: 0.5rem;
        background-color: var(--color-file-background);
        border-bottom-left-radius: 1rem;
        border-bottom-right-radius: 1rem;
        border: 1px solid var(--color-file-border);
        border-top: none;
    }

    .favorite {
        margin-right: 1rem;
        height: var(--secondary-icon-size);
    }

    @media (max-width: 900px) {
        .favorite {
            margin-right: 0.7rem;
        }
    }
</style>
