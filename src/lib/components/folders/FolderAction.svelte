<script lang="ts">
    import { createEventDispatcher, onDestroy, onMount } from "svelte";
    import doneIcon from "$lib/assets/done.svg?raw";
    import progressIcon from "$lib/assets/progress.svg?raw";
    import { activeParent } from "$lib/scripts/shared/stores";
    import {
        createFolder,
        deleteFolder,
        updateFolder,
    } from "$lib/scripts/gdrive/folder";
    import { getToken } from "$lib/scripts/shared/utils";

    const confirmText = "confirm";
    export let type: "create" | "update" | "delete";
    export let id = "";
    export let name = "";
    let placeholder = name || "";
    let dirField: HTMLInputElement;
    let submitDisabled = true;
    let progress = false;

    const dispatch = createEventDispatcher();
    function closeAction(ctx: string, detail?: any) {
        dispatch(ctx, detail);
    }
    async function actionHandler() {
        progress = true;
        const token = getToken();
        let dirName = placeholder
            .split(" ")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" ");
        type !== "delete" && (placeholder = dirName);
        if (type === "create") {
            await createFolder(dirName, $activeParent.id, token);
            closeAction("close");
        }
        if (type === "update") {
            await updateFolder(dirName, id, $activeParent.id, token);
            closeAction("close");
        }
        if (type === "delete") {
            await deleteFolder(id, $activeParent.id, token);
            closeAction("close");
        }
    }
    function checkDisabled() {
        if (type === "delete") {
            placeholder.trim() !== "confirm"
                ? (submitDisabled = true)
                : (submitDisabled = false);
        } else {
            placeholder.trim() === ""
                ? (submitDisabled = true)
                : (submitDisabled = false);
        }
    }
    onMount(() => {
        dirField?.focus();
        setTimeout(() => {
            if (placeholder.length === 1) placeholder = "";
        }, 0);
    });
    onDestroy(() => {
        progress = false;
    });
</script>

<form
    class="create"
    on:click={() => closeAction("close")}
    on:keypress|stopPropagation
    on:submit|preventDefault={actionHandler}
>
    <label
        class="wrapper"
        for="dir-name"
        on:click|stopPropagation
        on:keypress|stopPropagation
    >
        {#if type === "delete"}
            <p>
                All files and subfolders will be deleted and cannot be restored,
                Type ' <span class="h">confirm</span> ' if you want to continue.
            </p>
        {/if}
        <input
            type="text"
            id="dir-name"
            placeholder={type === "delete" ? confirmText : "Directory Name"}
            bind:value={placeholder}
            bind:this={dirField}
            on:click|stopPropagation
            on:keydown|stopPropagation
            on:input={checkDisabled}
            autocomplete="off"
        />
        {#if progress}
            <span class="btn progress-button">{@html progressIcon}</span>
        {:else}
            <button type="submit" class="btn" disabled={submitDisabled}
                >{@html doneIcon}</button
            >
        {/if}
    </label>
</form>

<style>
    .create {
        /* color: var(--color-white-level-two); */
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        display: grid;
        place-content: center;
        /* background-color: var(--primary-backdrop-color); */
        backdrop-filter: blur(1rem);
        -webkit-backdrop-filter: blur(1rem);
        z-index: 2;
    }
    .btn:disabled {
        cursor: not-allowed;
    }
    .btn:disabled :global(svg) {
        fill: red;
        cursor: not-allowed;
    }
    .wrapper {
        max-width: 35rem;
        padding: 5rem 4rem;
        background-color: var(--primary-backdrop-color);
        border-radius: 1rem;
        display: flex;
        flex-flow: row wrap;
        gap: 1rem;
        box-shadow: 0 0 1px 1px #fff3;
        justify-content: space-evenly;
        align-items: center;
        text-align: center;
    }
    .h {
        color: #0f0;
    }
    input {
        padding: 0.5rem;
        max-width: 80%;
        border-radius: 0.5rem;
        border: none;
        outline: none;
        background-color: var(--color-black-level-four);
        color: var(--color-white-level-two);
    }

    .btn :global(svg) {
        fill: #0f0;
        min-width: var(--primary-icon-size);
    }
    .btn {
        filter: none;
    }

    @keyframes spin {
        0% {
            transform: rotate(0deg);
        }
        50% {
            transform: rotate(180deg);
        }
        100% {
            transform: rotate(360deg);
        }
    }

    .progress-button {
        -webkit-animation: spin 1.5s linear 0s infinite;
        animation: spin 1s linear 0s infinite;
    }
    .progress-button :global(svg) {
        fill: var(--color-white-level-two);
    }
    @media (max-width: 600px) {
        .wrapper {
            max-width: 70%;
            margin: auto;
            padding: 3rem;
        }
        input {
            max-width: 80%;
        }
    }
</style>
