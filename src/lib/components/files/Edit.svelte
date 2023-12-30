<script lang="ts">
    import Dialog from "$lib/components/Dialog.svelte";
    import { mode, progress } from "$lib/scripts/shared/stores";
    import { onMount } from "svelte";
    import doneIcon from "$lib/assets/done.svg?raw";
    import closeIcon from "$lib/assets/close.svg?raw";
    import deleteIcon from "$lib/assets/deleteOutline.svg?raw";
    import moveIcon from "$lib/assets/move.svg?raw";
    import copyIcon from "$lib/assets/copy.svg?raw";
    import editIcon from "$lib/assets/editOutline.svg?raw";
    import selectallIcon from "$lib/assets/selectall.svg?raw";
    import Count from "../actions/Count.svelte";
    import FolderSelect from "../folders/FolderSelect.svelte";

    export let files: FileResponse;
    let dialog: Dialog;
    let container: HTMLElement;
    let set = new Set<string>();
    let allSelected = false;
    let count = 0;
    let action = "";
    let folderSelectVisible = false;
    let selectedParent = "";
    let confirm = false;

    function thumbClick(e: MouseEvent) {
        let target = e.target as HTMLImageElement;
        if (target === container) return;
        target.localName !== "img" && (target = target.querySelector("img"));
        const { id } = target.dataset;
        if (id) {
            if (set.has(id)) {
                set.delete(id);
                count--;
                target.classList.toggle("select");
                return;
            }
            set.add(id);
            count++;
            target.classList.toggle("select");
        }
    }

    onMount(() => {
        dialog.show();
    });

    function handleViewClose() {
        $mode = "";
        dialog.close();
    }

    function deleteAction() {
        // childWorker.postMessage({
        //     context: "DELETE",
        //     files: set,
        //     token: getToken(),
        // });
        confirm = true;
    }

    function selectAllAction() {
        allSelected = !allSelected;
        if (allSelected) {
            files.forEach((file) => set.add(file.id));
            count = set.size;
            return;
        }
        set.clear();
        count = set.size;
    }

    function folderSelectOk(e) {
        selectedParent = e.detail.id;
        folderSelectVisible = false;
        dialog.close();
        $progress = true;
        setTimeout(() => ($progress = false), 5000);
    }
    function folderSelectClose() {
        folderSelectVisible = false;
    }
</script>

<Dialog bind:this={dialog}>
    {#if files}
        <div class="edit-buttons">
            <button
                class="delelte-button btn"
                title="select all"
                on:click={selectAllAction}>{@html selectallIcon}</button
            >
            <button class="edit-button btn" title="edit" disabled={count === 0}
                >{@html editIcon}</button
            >
            <button
                class="move-button btn"
                title="move"
                disabled={count === 0}
                on:click={() => {
                    action = "MOVE";
                    folderSelectVisible = true;
                }}>{@html moveIcon}</button
            >
            <!-- <button class="copy-button btn" title="copy" disabled={count === 0}
                >{@html copyIcon}</button
            > -->
            <button
                class="delete-button btn"
                title="delete"
                disabled={count === 0}
                on:click={deleteAction}>{@html deleteIcon}</button
            >
            <Count {count} />
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
                    alt=""
                    height="150"
                    width="200"
                    data-id={file.id}
                    class:select={allSelected}
                    on:error={(e) => (e.target.src = imgPlaceholder)}
                />
            {/each}
        </div>
    {/if}
    {#if folderSelectVisible}
        <FolderSelect
            type="FILE"
            {set}
            on:close={folderSelectClose}
            on:ok={folderSelectOk}
        />
    {/if}
    {#if confirm}
        <section class="confirm-wrapper">
            <div class="confirm">
                <p>confirm to continue</p>
                <button class="btn">{@html closeIcon}</button>
                <button class="btn">{@html doneIcon}</button>
            </div>
        </section>
    {/if}
</Dialog>

<style>
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
        border-radius: 1rem;
        filter: brightness(0.6);
    }

    img:hover {
        cursor: pointer;
        filter: brightness(0.8);
    }
    .select {
        border-bottom: 3px solid var(--color-light-blue);
        filter: none;
        box-shadow: 0 0 5px 1px #fff5;
    }
    .select:hover {
        filter: none;
    }

    .edit-buttons {
        position: relative;
        padding-top: 2rem;
        padding-bottom: 4rem;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: 2rem;
        justify-content: flex-end;
    }
    button:disabled {
        cursor: not-allowed;
    }

    .confirm-wrapper,
    .spinner {
        position: fixed;
        top: 0;
        left: 0;
        height: 100%;
        width: 100%;
        display: grid;
        place-content: center;
        /* background-color: var(--primary-backdrop-color); */
        backdrop-filter: blur(1rem);
        -webkit-backdrop-filter: blur(1rem);
    }
    .confirm {
        background-color: var(--primary-backdrop-color);
        box-shadow: 0 0 10px 2px var(--color-focus);
        padding: 2rem;
        border-radius: 1rem;
        display: flex;
        align-items: center;
    }
    @media (max-width: 600px) {
        .edit-buttons {
            padding-top: 0rem;
            padding-bottom: 2rem;
            gap: 1rem;
            justify-content: space-evenly;
        }

        img {
            max-width: calc(var(--file-width) - 1rem);
        }
    }
</style>
