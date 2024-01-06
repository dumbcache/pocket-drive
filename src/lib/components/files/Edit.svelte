<script lang="ts">
    import Dialog from "$lib/components/Dialog.svelte";
    import { activeParent, mode, progress } from "$lib/scripts/shared/stores";
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
    import {
        childWorker,
        getToken,
        isValidUrl,
    } from "$lib/scripts/shared/utils";

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
        });
        dialog.close();
        confirm = false;
        $progress = true;
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
        childWorker.postMessage({
            context: "MOVE",
            parent: selectedParent,
            files: set,
            token: getToken(),
        });
    }
    function folderSelectClose() {
        folderSelectVisible = false;
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
        $progress = true;
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
                    class="ebtn s-prime"
                    title="edit"
                    disabled={count === 0}
                    on:click={() => (action = "EDIT")}>{@html editIcon}</button
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
                <!-- <button class="copy-button btn" title="copy" disabled={count === 0}
                >{@html copyIcon}</button
            > -->
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
        position: sticky;
        top: 0rem;
        z-index: 1;
        backdrop-filter: blur(5px);
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
        /* background-color: var(--primary-backdrop-color); */
        backdrop-filter: blur(1rem);
        -webkit-backdrop-filter: blur(1rem);
    }

    .edit-form {
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

    .action {
        width: 5rem;
        padding: 0.5rem;
        border: 1px solid var(--color-file-border);
        text-align: center;
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
    }
</style>
