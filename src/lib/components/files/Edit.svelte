<script lang="ts">
    import Dialog from "$lib/components/Dialog.svelte";
    import {
        activeParent,
        editProgress,
        mode,
        progress,
    } from "$lib/scripts/stores";
    import { onDestroy, onMount } from "svelte";
    import closeIcon from "$lib/assets/close.svg?raw";
    import playIcon from "$lib/assets/play.svg?raw";
    import deleteIcon from "$lib/assets/delete.svg?raw";
    import moveIcon from "$lib/assets/move.svg?raw";
    import copyIcon from "$lib/assets/copy.svg?raw";
    import editIcon from "$lib/assets/edit.svg?raw";
    import startIcon from "$lib/assets/start.svg?raw";
    import selectallIcon from "$lib/assets/selectall.svg?raw";
    import Count from "$lib/components/utils/Count.svelte";
    import FolderSelect from "$lib/components/folders/FolderSelect.svelte";
    import { childWorker, getToken, isValidUrl } from "$lib/scripts/utils";

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
    let name: string;
    let description: string;
    let invalid = false;

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
        container.scrollTo(0, window.scrollY);
    });
    onDestroy(() => {
        $mode = "";
    });

    function handleViewClose() {
        $mode = "";
        dialog.close();
    }

    function deleteAction() {
        childWorker.postMessage({
            context: "DELETE",
            files: set,
            token: getToken(),
            activeParent: $activeParent.id,
        });
        dialog.close();
        confirm = false;
        $editProgress = true;
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

    function moveToTop() {
        $editProgress = true;
        $mode = "";
        childWorker.postMessage({
            context: "TOP",
            parent: $activeParent.id,
            files: set,
            token: getToken(),
        });
        action = "";
    }

    function folderSelectOk(e) {
        selectedParent = e.detail.id;
        folderSelectVisible = false;
        dialog.close();
        $editProgress = true;
        childWorker.postMessage({
            context: action,
            parent: selectedParent,
            activeParent: $activeParent.id,
            files: set,
            token: getToken(),
        });
        action = "";
    }
    function folderSelectClose() {
        folderSelectVisible = false;
        action = "";
    }
    async function handleSave() {
        if (description) {
            if (!checkValid()) return;
        }
        childWorker.postMessage({
            parent: $activeParent.id,
            context: "EDIT",
            files: set,
            detail: { name, description },
            token: getToken(),
        });
        dialog.close();
        $editProgress = true;
    }

    function handleChange(e) {
        e.target.name = "url" && checkValid();
    }
    function checkValid() {
        if (description.trim() === "") {
            invalid = false;
            return;
        }
        const url = isValidUrl(description);
        if (!url) {
            invalid = true;
            return false;
        }
        invalid = false;
        return true;
    }
</script>

<Dialog bind:this={dialog}>
    {#if files}
        <div class="edit-buttons">
            {#if confirm}
                <button class="cancel action" on:click={() => (confirm = false)}
                    >cancel</button
                >
                <button class="confirm action" on:click={deleteAction}
                    >confirm</button
                >
            {:else}
                <button
                    class="btn s-prime"
                    title="select all"
                    on:click={selectAllAction}>{@html selectallIcon}</button
                >
                <button
                    class="btn s-prime"
                    title="edit"
                    disabled={count === 0}
                    on:click={() => (action = "EDIT")}>{@html editIcon}</button
                >
                <button
                    class="btn s-prime"
                    title="move to start"
                    disabled={count === 0}
                    on:click={() => moveToTop()}>{@html startIcon}</button
                >
                <button
                    class="btn s-prime"
                    title="move"
                    disabled={count === 0}
                    on:click={() => {
                        action = "MOVE";
                        folderSelectVisible = true;
                    }}>{@html moveIcon}</button
                >
                <button
                    class="btn s-prime"
                    title="copy"
                    disabled={count === 0}
                    on:click={() => {
                        action = "COPY";
                        folderSelectVisible = true;
                    }}>{@html copyIcon}</button
                >
                <button
                    class="btn s-prime"
                    title="delete"
                    disabled={count === 0}
                    on:click={() => (confirm = true)}>{@html deleteIcon}</button
                >
            {/if}
            <Count {count} />
            <button class="btn s-prime" on:click={handleViewClose}
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
                <div class="img">
                    <img
                        src={file.thumbnailLink}
                        alt=""
                        height="150"
                        width="200"
                        data-id={file.id}
                        class:select={allSelected}
                    />
                    {#if file.mimeType.match("video/")}
                        <div class="play">{@html playIcon}</div>
                    {/if}
                </div>
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
    {#if action === "EDIT"}
        <div
            class="edit-form-wrapper"
            on:keydown
            on:click={() => (action = "")}
        >
            <form
                class="edit-form"
                on:keydown|stopPropagation
                on:click|stopPropagation
                on:submit|preventDefault={handleSave}
            >
                <p>Enter either values</p>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    bind:value={name}
                    on:change={handleChange}
                    autocomplete="off"
                />
                <input
                    type="url"
                    name="url"
                    class:invalid
                    placeholder="URL"
                    bind:value={description}
                    on:change={handleChange}
                    autocomplete="off"
                />

                {#if invalid}
                    <p class="alert">Enter valid url</p>
                {/if}
                <div class="button-wrapper">
                    <button
                        class="cancel action"
                        type="reset"
                        on:click={() => (action = "")}>cancel</button
                    >
                    <button
                        class="save action"
                        type="submit"
                        on:click={handleSave}>save</button
                    >
                </div>
            </form>
        </div>
    {/if}
</Dialog>

<style>
    .wrapper {
        display: flex;
        flex-flow: row wrap;
        align-items: flex-start;
        justify-content: center;
        gap: var(--content-gap);
        padding: 2rem 0rem;
        height: 84%;
        overflow-y: auto;
    }
    .img {
        position: relative;
    }

    img {
        display: block;
        overflow: hidden;
        height: fit-content;
        max-width: var(--file-width);
        border-radius: 1rem;
    }

    img:hover {
        cursor: pointer;
        filter: brightness(0.8);
    }
    .select {
        /* filter: none; */
        box-shadow: 0 0 5px 1px #fff5;
        filter: brightness(0.3);
    }

    .img:has(.select) {
        border-bottom: 5px solid var(--color-light-blue);
        border-radius: 1rem;
    }
    .select:hover {
        filter: none;
        filter: brightness(0.3);
    }

    .edit-buttons {
        position: sticky;
        top: 0rem;
        z-index: 1;
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        padding: 2rem 0rem;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: 2rem;
        justify-content: flex-end;
    }
    button:disabled {
        cursor: not-allowed;
    }

    .edit-form-wrapper {
        position: fixed;
        top: 0;
        left: 0;
        bottom: 0;
        right: 0;
        height: 100%;
        width: 100%;
        display: grid;
        place-content: center;
        backdrop-filter: blur(1rem);
        -webkit-backdrop-filter: blur(1rem);
    }

    .edit-form {
        color: var(--color-three);
        background-color: var(--primary-bg-color);
        box-shadow: 0 0 1px 2px var(--color-focus);
        display: flex;
        flex-flow: column nowrap;
        padding: 3rem;
        gap: 1rem;
        border-radius: 1rem;
    }
    input {
        background: unset;
        padding: 0.5rem;
        border: none;
        /* border-bottom: 1px solid var(--color-focus); */
        background-color: var(--bg-color-four);
        padding: 1rem;
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
    }
    input:active,
    input:focus {
        background-color: var(--bg-color-five);
        border-bottom: 2px solid var(--color-focus);
        outline: none;
    }
    .invalid {
        border-bottom: 2px solid #f00;
    }
    .invalid:hover {
        border-bottom: 2px solid #f00;
    }

    .action {
        width: 5rem;
        padding: 0.5rem;
        border: 1px solid var(--color-file-border);
        text-align: center;
        border-radius: 0.5rem;
    }
    .action:hover {
        background-color: var(--bg-color-four);
    }
    .button-wrapper {
        display: flex;
        /* justify-content: center; */
        gap: 1rem;
    }
    .alert {
        color: #aaa;
        font-size: 1.2rem;
    }
    .play {
        width: 4rem;
        height: 4rem;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        background-color: #0007;
        box-shadow: 0 0 20px 5px #fff;
        border-radius: 50%;
        backdrop-filter: blur(10px);
    }
    .play :global(svg) {
        fill: #fff;
    }
    @media (max-width: 600px) {
        .edit-buttons {
            padding: 1rem 0rem;
            gap: 1rem;
            justify-content: space-evenly;
        }

        img {
            max-width: calc(var(--file-width) - 1rem);
        }
        input {
            font-size: 1.5rem;
            padding: 0.5rem;
            border: 1px solid #fff3;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
        }
        .play {
            width: 2rem;
            height: 2rem;
        }
    }
</style>
