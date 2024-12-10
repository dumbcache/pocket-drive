<script lang="ts">
    import closeIcon from "$lib/assets/close.svg?raw";
    import deleteIcon from "$lib/assets/delete.svg?raw";
    import moveIcon from "$lib/assets/move.svg?raw";
    import copyIcon from "$lib/assets/copy.svg?raw";
    import editIcon from "$lib/assets/edit.svg?raw";
    import visibleIcon from "$lib/assets/visible.svg?raw";
    import hiddenIcon from "$lib/assets/hidden.svg?raw";
    import startIcon from "$lib/assets/start.svg?raw";
    import selectallIcon from "$lib/assets/selectall.svg?raw";
    import Count from "$lib/components/utils/Count.svelte";
    import {
        childWorker,
        fetchMultiple,
        FOLDER_MIME_TYPE,
        isValidUrl,
    } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";
    import {
        folderStore,
        pocketStore,
        progressStore,
        states,
        tempStore,
    } from "$lib/scripts/stores.svelte";
    import Select from "$lib/components/folders/Select.svelte";

    let {
        set,
        view,
        count = 0,
        memory = 0,
        closeHandler,
        selectAllHandler,
    }: {
        set: Set<string>;
        view: View;
        count: number;
        memory: number;
        closeHandler: Function;
        selectAllHandler: Function;
    } = $props();

    let action = $state("");
    let folderSelectVisible = $state(false);
    let selectedParent = "";
    let confirm = $state(false);
    let name: string = $state("");
    let description: string = $state("");
    let invalid = $state(false);
    let workerMessage: WorkerMessage;

    function confirmAction() {
        if (action === "DELETE") deleteAction();
        if (action === "TOP") moveToTop();
    }
    function deleteAction() {
        progressStore.update(set.size);
        workerMessage = {
            context: "DELETE",
            ids: set,
            token: getToken(),
            activeParent: tempStore.activeFolder!.id,
            view,
        };
        childWorker.postMessage(workerMessage);
        confirm = false;
        closeHandler("DELETE");
    }

    function moveToTop() {
        states.mode = "";
        progressStore.update(set.size);
        workerMessage = {
            context: "TOP",
            parent: tempStore.activeFolder!.id,
            ids: set,
            token: getToken(),
        };
        childWorker.postMessage(workerMessage);
        action = "";
        closeHandler("TOP");
    }

    function folderSelectOk(id) {
        selectedParent = id;
        folderSelectVisible = false;
        progressStore.update(set.size);
        workerMessage = {
            context: action,
            parent: selectedParent,
            activeParent: tempStore.activeFolder!.id,
            ids: set,
            token: getToken(),
            view,
        };
        childWorker.postMessage(workerMessage);
        closeHandler(action);
        action = "";
    }
    function folderSelectClose() {
        folderSelectVisible = false;
        action = "";
    }
    async function handleSave(e) {
        e.preventDefault();
        if (description.trim()) {
            if (!checkValid()) return;
        }
        progressStore.update(set.size);
        name?.trim() || (name = undefined);
        description?.trim() || (description = undefined);
        workerMessage = {
            activeParent: tempStore.activeFolder!.id,
            context: "EDIT",
            ids: set,
            imgMeta: { name, description },
            token: getToken(),
        };
        childWorker.postMessage(workerMessage);
        closeHandler();
    }
    function handleHidden(hidden: Boolean) {
        let parent = tempStore.activeFolder!.id;
        let token = getToken();
        workerMessage = {
            activeParent: parent,
            context: "EDIT",
            ids: set,
            imgMeta: { properties: { hidden } },
            token,
        };
        childWorker.postMessage(workerMessage);
        closeHandler();
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
    onkeydown={(e) => {
        e.key === "Escape" && closeHandler();
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
        <button class="cancel action" onclick={() => (confirm = false)}
            >cancel</button
        >
        <button class="confirm action" onclick={confirmAction}>confirm</button>
    {:else}
        <button
            class="btn s-prime"
            title="select all"
            onclick={selectAllHandler}>{@html selectallIcon}</button
        >
        <button
            class="btn s-prime"
            title="move"
            disabled={count === 0}
            onclick={() => {
                action = "MOVE";
                folderSelectVisible = true;
            }}>{@html moveIcon}</button
        >
        {#if view === "FILE"}
            <button
                class="btn s-prime"
                title="copy"
                disabled={count === 0}
                onclick={() => {
                    action = "COPY";
                    folderSelectVisible = true;
                }}>{@html copyIcon}</button
            >
            <button
                class="btn s-prime"
                title="edit"
                disabled={count === 0}
                onclick={() => (action = "EDIT")}>{@html editIcon}</button
            >
            <button
                class="btn s-prime"
                title="move to start"
                disabled={count === 0}
                onclick={() => {
                    action = "TOP";
                    confirm = true;
                }}>{@html startIcon}</button
            >
        {:else}
            {#if states.searchMode}
                <button
                    class="btn s-prime"
                    title="unhide"
                    disabled={count === 0}
                    onclick={() => handleHidden(false)}
                    >{@html visibleIcon}</button
                >
            {/if}
            <button
                class="btn s-prime"
                title="hide"
                disabled={count === 0}
                onclick={() => handleHidden(true)}>{@html hiddenIcon}</button
            >
        {/if}
        <button
            class="btn s-prime"
            title="delete"
            disabled={count === 0}
            onclick={() => {
                action = "DELETE";
                confirm = true;
            }}>{@html deleteIcon}</button
        >
    {/if}
    <Count {count} />
    <button class="btn s-prime" onclick={closeHandler}>{@html closeIcon}</button
    >
</div>

{#if folderSelectVisible}
    <Select onClose={folderSelectClose} onDone={folderSelectOk} />
{/if}
{#if action === "EDIT"}
    <!-- svelte-ignore a11y_click_events_have_key_events -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div class="edit-form-wrapper" onclick={() => (action = "")}>
        <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
        <form
            class="edit-form"
            onkeydown={(e) => e.stopPropagation()}
            onclick={(e) => e.stopPropagation()}
            onsubmit={handleSave}
        >
            <div class="input-wrapper">
                <p class="label">Enter either values</p>
                <input
                    type="text"
                    name="name"
                    placeholder="Name"
                    bind:value={name}
                    onchange={handleChange}
                    autocomplete="off"
                />
                <input
                    type="url"
                    name="url"
                    class:invalid
                    placeholder="URL"
                    bind:value={description}
                    onchange={handleChange}
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
                    onclick={() => (action = "")}>Cancel</button
                >
                <button
                    class="save action"
                    type="submit"
                    disabled={name?.trim().length <= 0 &&
                        description?.trim().length <= 0 &&
                        true}
                    onclick={handleSave}>Save</button
                >
            </div>
        </form>
    </div>
{/if}

<style>
    .edit-buttons {
        position: sticky;
        top: 3rem;
        z-index: 1;
        background: var(--color-bg);
        padding: 0rem 1rem;
        padding-bottom: 2rem;
        display: flex;
        flex-flow: row nowrap;
        align-items: center;
        gap: 2rem;
        justify-content: flex-end;
        font-size: var(--size-smaller);
        width: fit-content;
        margin-left: auto;
        margin-right: 10rem;
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
        background-color: var(--color-popup);
        box-shadow: 0 0 15px 0px var(--color-shadow);
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
        border-bottom: 2px solid var(--color-lite);
    }
    input:active,
    input:focus {
        /* background-color: var(--color-lite); */
        filter: invert(0.1);
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

    .alert {
        color: var(--color-red);
        font-size: 1.2rem;
    }
    .action {
        padding: 0.5rem;
        width: 8rem;
        border-radius: 0.5rem;
    }

    .button-wrapper {
        display: flex;
        justify-content: center;
        border-top: 1px solid var(--color-lite);
    }
    .button-wrapper .action {
        width: 50%;
        padding: 1rem 0rem;
        background-color: unset;
        border-radius: unset;
    }
    .save {
        border-left: 1px solid var(--color-lite);
    }

    .action:hover {
        background-color: var(--color-lite);
        filter: invert(0.1);
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
            width: 100%;
            margin: 0;
            padding: 1.5rem 0rem;
            gap: 1rem;
            justify-content: space-evenly;
            top: 0rem;
        }

        .memory {
            font-size: 1.3rem;
        }
        .action {
            width: 6rem;
        }
    }
</style>
