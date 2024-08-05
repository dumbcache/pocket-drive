<script lang="ts">
    import { onDestroy, onMount } from "svelte";
    import doneIcon from "$lib/assets/done.svg?raw";
    import {
        activeFolder,
        folderAction,
        folderActionDetail,
        folderStore,
    } from "$lib/scripts/stores";
    import { getToken } from "$lib/scripts/login";
    import {
        toTitleCase,
        afterFolderAction,
        createFolder,
        deleteFolder,
        updateFolder,
        fetchMultiple,
        FOLDER_MIME_TYPE,
    } from "$lib/scripts/utils";
    import Spinner from "$lib/components/utils/Spinner.svelte";

    const confirmText = "confirm";
    let type: FolderAction, id: string, name: string, placeholder: string;

    onMount(() => {
        try {
            type = $folderAction;
            id = $folderActionDetail?.id;
            name = $folderActionDetail?.name;
            placeholder = name || "";
            type === "DELETE" && (placeholder = "");
        } catch (error) {
            console.info(error);
        }
    });

    let dirField: HTMLInputElement;
    let submitDisabled = true;
    let progress = false;

    function close() {
        $folderAction = undefined;
        $folderActionDetail = undefined;
    }

    async function applyAction() {
        progress = true;
        const token = getToken();
        let folderName = toTitleCase(placeholder);
        type !== "DELETE" && (placeholder = folderName);
        let parent = $activeFolder.id;
        if (type === "CREATE") {
            const data = await createFolder(folderName, parent, token);
            folderStore.update((prev) => {
                return {
                    files: [
                        {
                            id: data.id,
                            name: data.name,
                            parents: [parent],
                            starred: false,
                        },
                        ...prev?.files,
                    ],
                    nextPageToken: prev?.nextPageToken,
                };
            });
            fetchMultiple(
                { parent, mimeType: FOLDER_MIME_TYPE, pageSize: 500 },
                token,
                true
            );
            afterFolderAction(parent, token);
            close();
        }
        if (type === "EDIT") {
            await updateFolder(folderName, id, parent, token);
            folderStore.update((prev) => {
                return {
                    files: prev?.files.map((file) => {
                        if (file.id === id) {
                            return { ...file, name: folderName };
                        }
                        return file;
                    }),
                    nextPageToken: prev?.nextPageToken,
                };
            });
            afterFolderAction(parent, token);
            close();
        }
        if (type === "DELETE") {
            await deleteFolder(id, parent, token);
            folderStore.update((prev) => {
                return {
                    files: prev?.files.filter((file) => file.id !== id),
                    nextPageToken: prev?.nextPageToken,
                };
            });
            afterFolderAction(parent, token);
            close();
        }
    }
    function checkDisabled() {
        if (type === "DELETE") {
            placeholder.trim().toLowerCase() !== "confirm"
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

<!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
<form
    class="create"
    on:click={() => progress || close()}
    on:keypress|stopPropagation
    on:submit|preventDefault={applyAction}
    on:wheel|preventDefault
>
    <!-- svelte-ignore a11y-no-noninteractive-element-interactions -->
    <label
        class="wrapper"
        for="dir-name"
        on:click|stopPropagation
        on:keypress|stopPropagation
    >
        {#if type === "DELETE"}
            <p>
                All files and subfolders will be deleted and cannot be restored,
                Type ' <span class="h">confirm</span> ' if you want to continue.
            </p>
        {:else if type === "CREATE"}
            <p class="label">Create folder</p>
        {:else}
            <p class="label">Rename folder</p>
        {/if}
        <input
            type="text"
            id="dir-name"
            placeholder={type === "DELETE" ? confirmText : "Directory Name"}
            bind:value={placeholder}
            bind:this={dirField}
            on:click|stopPropagation
            on:keydown|stopPropagation
            on:input={checkDisabled}
            autocomplete="off"
        />
        {#if progress}
            <Spinner borderWidth="2px" width="3rem" height="3rem" />
        {:else}
            <button
                type="submit"
                class="btn s-prime"
                disabled={submitDisabled}
                on:click={applyAction}>{@html doneIcon}</button
            >
        {/if}
    </label>
</form>

<style>
    .create {
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        display: grid;
        place-content: center;
        background-color: var(--color-backdrop);
        z-index: 2;
    }
    .btn:disabled {
        cursor: not-allowed;
    }
    .btn:disabled :global(svg) {
        fill: var(--color-two);
        cursor: not-allowed;
    }
    .wrapper {
        max-width: 35rem;
        padding: 5rem 4rem;
        border-radius: 1rem;
        display: flex;
        flex-flow: row wrap;
        gap: 1.5rem 1rem;
        justify-content: space-evenly;
        align-items: center;
        text-align: center;
        box-shadow: 0 0 50px -10px var(--color-black);
        background-color: var(--color-bg-one);
    }
    .h {
        color: var(--color-green);
    }
    .label {
        margin-right: auto;
        margin-left: 0.5rem;
        color: var(--color-one);
    }
    input {
        padding: 1rem;
        max-width: 80%;
        border-radius: 0.5rem;
        border: none;
        outline: none;
        background-color: var(--color-bg-two);
    }
    input:active,
    input:focus {
        background-color: var(--color-bg-three);
        outline: none;
    }

    .btn :global(svg) {
        fill: var(--color-green);
        min-width: var(--primary-icon-size);
    }

    @media (max-width: 600px) {
        .wrapper {
            max-width: 85%;
            margin: auto;
            padding: 4rem 2rem;
        }
        input {
            max-width: 80%;
            padding: 0.7rem;
        }
    }
</style>
