<script lang="ts">
    import { activeParent, editProgress, mode } from "$lib/scripts/stores";
    import closeIcon from "$lib/assets/close.svg?raw";
    import deleteIcon from "$lib/assets/delete.svg?raw";
    import moveIcon from "$lib/assets/move.svg?raw";
    import copyIcon from "$lib/assets/copy.svg?raw";
    import editIcon from "$lib/assets/edit.svg?raw";
    import startIcon from "$lib/assets/start.svg?raw";
    import selectallIcon from "$lib/assets/selectall.svg?raw";
    import Count from "$lib/components/utils/Count.svelte";
    import FolderSelect from "$lib/components/folders/FolderSelect.svelte";
    import { childWorker, getToken, isValidUrl } from "$lib/scripts/utils";
    import { createEventDispatcher } from "svelte";

    export let set: Set, count: Number;

    let action = "";
    let folderSelectVisible = false;
    let selectedParent = "";
    let confirm = false;
    let name: string;
    let description: string;
    let invalid = false;

    const dispatch = createEventDispatcher();

    function close(type?: string) {
        $mode = "";
        dispatch("close", { type });
    }

    function deleteAction() {
        childWorker.postMessage({
            context: "DELETE",
            files: set,
            token: getToken(),
            activeParent: $activeParent.id,
        });
        confirm = false;
        $editProgress = true;
        close("delete");
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
        close();
    }

    function folderSelectOk(e) {
        selectedParent = e.detail.id;
        folderSelectVisible = false;
        $editProgress = true;
        childWorker.postMessage({
            context: action,
            parent: selectedParent,
            activeParent: $activeParent.id,
            files: set,
            token: getToken(),
        });
        action = "";
        close();
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
        $editProgress = true;
        close();
    }

    function handleChange(e) {
        e.target.name = "url" && checkValid();
    }
    function checkValid() {
        if (description?.trim() === "") {
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

<div class="edit-buttons">
    {#if confirm}
        <button class="cancel action" on:click={() => (confirm = false)}
            >cancel</button
        >
        <button class="confirm action" on:click={deleteAction}>confirm</button>
    {:else}
        <button
            class="btn s-prime"
            title="select all"
            on:click={() => {
                dispatch("selectAll");
            }}>{@html selectallIcon}</button
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
    <button class="btn s-prime" on:click={close}>{@html closeIcon}</button>
</div>

{#if folderSelectVisible}
    <FolderSelect
        type="FILE"
        {set}
        on:close={folderSelectClose}
        on:ok={folderSelectOk}
    />
{/if}
{#if action === "EDIT"}
    <!-- svelte-ignore a11y-no-static-element-interactions -->
    <div class="edit-form-wrapper" on:keydown on:click={() => (action = "")}>
        <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
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
                <button class="save action" type="submit" on:click={handleSave}
                    >save</button
                >
            </div>
        </form>
    </div>
{/if}

<style>
    .edit-buttons {
        position: sticky;
        top: 0rem;
        z-index: 1;
        background: var(--primary-bg-color);
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
        z-index: 1;
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
        width: 7rem;
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

    @media (max-width: 900px) {
        input {
            font-size: 1.5rem;
            padding: 0.5rem;
            border: 1px solid #fff3;
            border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem;
        }
    }
    @media (max-width: 500px) {
        .edit-buttons {
            padding: 1rem 0rem;
            gap: 1rem;
            justify-content: space-evenly;
        }
    }
</style>
