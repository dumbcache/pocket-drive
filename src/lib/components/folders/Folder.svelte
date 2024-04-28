<script lang="ts">
    import { goto } from "$app/navigation";
    import FolderCover from "$lib/components/folders/FolderCover.svelte";
    import { IMG_MIME_TYPE, fetchMultiple, getToken } from "$lib/scripts/utils";
    import { storeSnap, pocketStore } from "$lib/scripts/stores";

    export let visible: Boolean;
    export let toolsVisible: Boolean = true;
    export let folder: Folder;

    let hover = false;
    let timeout: number;
    let peakElement: HTMLDivElement;
    let files: GoogleFile[] = [];

    function dirNavigate(e: MouseEvent) {
        clearTimeout(timeout);
        storeSnap();
        goto(`/${folder.id}`);
    }
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

<div class="card" on:dragstart|preventDefault data-id={folder.id}>
    <!-- on:mouseleave={closePeak}
    on:mouseenter={displayPeak} -->
    <button on:click={dirNavigate} class:hover>
        <FolderCover
            id={folder.id}
            name={folder.name}
            starred={folder.starred}
            {toolsVisible}
            {visible}
            on:fav={() => (folder.starred = !folder.starred)}
        />
    </button>
    <h2 class="dir-title" title={folder.name}>{folder.name}</h2>

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

    .hover {
        filter: brightness(0.5);
    }
    button {
        filter: none;
    }
    .card {
        width: var(--dir-width);
    }
    .dir-title {
        word-wrap: unset;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
    }
</style>
