<script lang="ts">
    import {
        activeParent,
        mode,
        updateProgressStore,
    } from "$lib/scripts/stores";
    import closeIcon from "$lib/assets/close.svg?raw";
    import deleteIcon from "$lib/assets/delete.svg?raw";
    import moveIcon from "$lib/assets/move.svg?raw";
    import copyIcon from "$lib/assets/copy.svg?raw";
    import editIcon from "$lib/assets/edit.svg?raw";
    import startIcon from "$lib/assets/start.svg?raw";
    import selectallIcon from "$lib/assets/selectall.svg?raw";
    import Count from "$lib/components/utils/Count.svelte";
    import FolderSelect from "$lib/components/folders/FolderSelect.svelte";
    import { childWorker, isValidUrl } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";
    import { createEventDispatcher, onDestroy, onMount } from "svelte";

    export let set: Set<string>,
        view: "FILE" | "FOLDER",
        count: Number = 0,
        memory: Number = 0;

    let action = "";
    let folderSelectVisible = false;
    let selectedParent = "";
    let confirm = false;
    let name: string = "";
    let description: string = "";
    let invalid = false;
    let workerMessage: WorkerMessage;

    const dispatch = createEventDispatcher();

    function close(type?: string) {
        $mode = "";
        dispatch("close", { type });
    }
    function confirmAction() {
        if (action === "DELETE") deleteAction();
        if (action === "TOP") moveToTop();
    }
    function deleteAction() {
        updateProgressStore(set.size);
        workerMessage = {
            context: "DELETE",
            ids: set,
            token: getToken(),
            activeParent: $activeParent.id,
            view,
        };
        childWorker.postMessage(workerMessage);
        confirm = false;
        close("DELETE");
    }

    function moveToTop() {
        $mode = "";
        updateProgressStore(set.size);
        workerMessage = {
            context: "TOP",
            parent: $activeParent.id,
            ids: set,
            token: getToken(),
        };
        childWorker.postMessage(workerMessage);
        action = "";
        close();
    }

    function folderSelectOk(e) {
        selectedParent = e.detail.id;
        folderSelectVisible = false;
        updateProgressStore(set.size);
        workerMessage = {
            context: action,
            parent: selectedParent,
            activeParent: $activeParent.id,
            ids: set,
            token: getToken(),
            view,
        };
        childWorker.postMessage(workerMessage);
        close(action);
        action = "";
    }
    function folderSelectClose() {
        folderSelectVisible = false;
        action = "";
    }
    async function handleSave() {
        if (description.trim()) {
            if (!checkValid()) return;
        }
        updateProgressStore(set.size);
        name?.trim() || (name = undefined);
        description?.trim() || (description = undefined);
        workerMessage = {
            activeParent: $activeParent.id,
            context: "EDIT",
            ids: set,
            imgMeta: { name, description },
            token: getToken(),
        };
        childWorker.postMessage(workerMessage);
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

<svelte:window
    on:keydown={(e) => {
        e.key === "Escape" && close();
    }}
/>

<div class="edit-buttons">
    {#if confirm}
        {#if view === "FILE"}
            <p class="memory">
                Size: <span>
                    {(memory / (1024 * 1024)).toFixed(2)} MB
                </span>
            </p>
        {/if}
        <button class="cancel action" on:click={() => (confirm = false)}
            >cancel</button
        >
        <button class="confirm action" on:click={confirmAction}>confirm</button>
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
            title="move"
            disabled={count === 0}
            on:click={() => {
                action = "MOVE";
                folderSelectVisible = true;
            }}>{@html moveIcon}</button
        >
        {#if view === "FILE"}
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
                title="edit"
                disabled={count === 0}
                on:click={() => (action = "EDIT")}>{@html editIcon}</button
            >
            <button
                class="btn s-prime"
                title="move to start"
                disabled={count === 0}
                on:click={() => {
                    action = "TOP";
                    confirm = true;
                }}
                on:click={() => moveToTop()}>{@html startIcon}</button
            >
        {/if}
        <button
            class="btn s-prime"
            title="delete"
            disabled={count === 0}
            on:click={() => {
                action = "DELETE";
                confirm = true;
            }}>{@html deleteIcon}</button
        >
    {/if}
    <Count {count} />
    <button class="btn s-prime" on:click={close}>{@html closeIcon}</button>
</div>

{#if folderSelectVisible}
    <FolderSelect
        type="FILE"
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
            <div class="input-wrapper">
                <p class="label">Enter either values</p>
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
            </div>
            <div class="button-wrapper">
                <button
                    class="cancel action"
                    type="reset"
                    on:click={() => (action = "")}>Cancel</button
                >
                <button
                    class="save action"
                    type="submit"
                    disabled={name?.trim().length <= 0 &&
                        description?.trim().length <= 0 &&
                        true}
                    on:click={handleSave}>Save</button
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
        background: var(--color-bg);
        padding: 2rem 0rem;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: 2rem;
        justify-content: flex-end;
        font-size: var(--size-smaller);
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
        background-color: var(--color-backdrop);
        z-index: 1;
        font-size: var(--size-smaller);
    }

    .edit-form {
        background-color: var(--color-bg-one);
        box-shadow: 0 0 50px -10px var(--color-black);
        display: flex;
        flex-flow: column nowrap;
        gap: 1rem;
        border-radius: 1rem;
        overflow: hidden;
    }
    .label {
        padding-left: 0.7rem;
        padding-bottom: 1rem;
    }
    input {
        background: unset;
        padding: 0.5rem;
        border: none;
        /* border-bottom: 1px solid var(--color-focus); */
        background-color: var(--color-bg-one);
        padding: 1rem;
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        border-bottom: 2px solid var(--color-border);
    }
    input:active,
    input:focus {
        background-color: var(--color-bg-two);
        border-bottom: 2px solid var(--color-focus);
        outline: none;
    }
    .invalid {
        border-bottom: 2px solid var(--color-red);
    }
    .invalid:hover {
        border-bottom: 2px solid var(--color-red);
    }

    .input-wrapper {
        display: flex;
        flex-flow: column nowrap;
        gap: 1rem;
        padding: 3rem;
        padding-bottom: 1rem;
    }

    ::placeholder {
        font-size: smaller;
    }
    .cancel,
    .confirm {
        background-color: var(--color-bg-one);
    }

    .alert {
        color: #aaa;
        font-size: 1.2rem;
    }
    .action {
        padding: 0.5rem;
        width: 8rem;
        border-radius: 0.5rem;
        background-color: var(--color-bg-two);
    }

    .button-wrapper {
        display: flex;
        justify-content: center;
        background-color: var(--color-bg-two);
    }
    .button-wrapper .action {
        width: 50%;
        padding: 1rem 0rem;
        background-color: unset;
        border-radius: unset;
    }
    .save {
        border-left: 1px solid var(--color-border);
    }

    .action:hover {
        background-color: var(--color-bg-three);
    }
    .action:disabled {
        background-color: var(--color-bg-two);
    }
    @media (max-width: 900px) {
        input {
            font-size: var(--size-smaller);
            padding: 0.7rem;
            /* border: 1px solid #fff3; */
            /* border-top-left-radius: 0.5rem;
            border-top-right-radius: 0.5rem; */
        }
    }
    @media (max-width: 500px) {
        .edit-buttons {
            padding: 1.5rem 0rem;
            gap: 1rem;
            justify-content: space-evenly;
        }

        .memory {
            font-size: 1.3rem;
        }
        .action {
            width: 6rem;
        }
    }
</style>
