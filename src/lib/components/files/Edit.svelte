<script lang="ts">
    import Dialog from "$lib/components/Dialog.svelte";
    import { mode } from "$lib/scripts/shared/stores";
    import { onMount } from "svelte";
    import closeIcon from "$lib/assets/close.svg?raw";
    import deleteIcon from "$lib/assets/deleteOutline.svg?raw";
    import moveIcon from "$lib/assets/move.svg?raw";
    import editIcon from "$lib/assets/editOutline.svg?raw";
    import selectallIcon from "$lib/assets/selectall.svg?raw";

    export let files: FileResponse;
    let dialog: Dialog;
    let container: HTMLElement;
    let set = new Set<string>();

    function thumbClick(e: MouseEvent) {
        let target = e.target as HTMLImageElement;
        if (target === container) return;
        target.localName !== "img" && (target = target.querySelector("img"));
        const { id } = target.dataset;
        if (id) {
            target.classList.toggle("select");
            set.has(id) ? set.delete(id) : set.add(id);
        }
    }

    onMount(() => {
        dialog.show();
    });

    function handleViewClose() {
        $mode = "";
        dialog.close();
    }
</script>

<Dialog bind:this={dialog}>
    {#if files}
        <div class="edit-buttons">
            <p class="count" title="count">
                {set.size}
            </p>
            <button
                class="delelte-button btn"
                title="select all"
                on:click={() => {}}>{@html selectallIcon}</button
            >
            <button class="edit-button btn" title="edit"
                >{@html editIcon}</button
            >
            <button class="move-button btn" title="move"
                >{@html moveIcon}</button
            >
            <button class="delelte-button btn" title="delete"
                >{@html deleteIcon}</button
            >
            <button class="btn close" on:click={handleViewClose}
                >{@html closeIcon}</button
            >
        </div>
        <div
            class="wrapper"
            on:click={thumbClick}
            on:keydown
            on:dragstart|preventDefault
            bind:this={container}
        >
            {#each files as file}
                <img
                    src={file.thumbnailLink}
                    alt="thumbnail to link"
                    height="150"
                    width="200"
                    data-id={file.id}
                    class:select={false}
                    on:error={(e) => (e.target.src = imgPlaceholder)}
                />
            {/each}
        </div>
    {/if}
</Dialog>

<style>
    .count {
        font-size: 1.3rem;
        min-width: 5rem;
        block-size: 100%;
        border: 1px solid var(--color-file-border);
        border-right: 5px solid var(--color-light-blue);
        /* text-align: right; */
        padding: 0.5rem;
        /* background-color: var(--color-three); */
    }

    .wrapper {
        display: flex;
        flex-flow: row wrap;
        align-items: flex-start;
        justify-content: center;
        gap: var(--content-gap);
    }

    img {
        display: block;
        overflow: hidden;
        height: fit-content;
        max-width: var(--file-width);
        /* max-width: 10rem;
        height: 10rem;
        object-fit: cover;
        object-position: top; */
        /* border: 1px solid var(--color-file-border); */
        border-radius: 1rem;
        filter: brightness(0.8);
    }

    img:hover {
        cursor: pointer;
        filter: brightness(0.8);
    }
    .select {
        border: 2px solid var(--color-light-blue);
        border-bottom: 5px solid var(--color-light-blue);
        filter: none;
        /* margin: 2rem; */
        /* filter: brightness(0.5); */
        box-shadow: 0 0 5px 1px #fff5;
    }
    .select:hover {
        filter: none;
        /* filter: brightness(0.5); */
    }

    .edit-buttons {
        position: relative;
        padding: 2rem;
        display: flex;
        flex-flow: row nowrap;
        justify-content: flex-end;
        gap: 2rem;
    }
    .close {
        /* position: absolute;
        top: 50%;
        right: 0;
        transform: translate(0%, -50%); */
    }

    @media (max-width: 600px) {
        .close {
            top: 0.5rem;
            right: 0.5rem;
        }
    }
</style>
