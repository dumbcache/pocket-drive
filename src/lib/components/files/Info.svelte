<script lang="ts">
    import { activeImage, activeParent, fileStore } from "$lib/scripts/stores";
    import closeIcon from "$lib/assets/close.svg?raw";
    import { createEventDispatcher, onMount } from "svelte";
    import {
        getToken,
        isValidUrl,
        IMG_MIME_TYPE,
        fetchMultiple,
        updateSingle,
    } from "$lib/scripts/utils";
    import { fade } from "svelte/transition";

    const dispatch = createEventDispatcher();
    let id: string = $activeImage.id;
    let name: string = $activeImage.name;
    let description: string = $activeImage.description;
    let size: number = $activeImage.size;

    let invalid = false;
    let changes = true;
    onMount(() => {
        return activeImage.subscribe((data) => {
            name = data.name;
            description = data.description;
            id = data.id;
            size = data.size;
            size =
                size > 1024 * 1024
                    ? `${(size / (1024 * 1024)).toFixed()} MB`
                    : `${(size / 1024).toFixed()} KB`;
            invalid = false;
            changes = false;
        });
    });
    async function handleSave() {
        if (description) {
            if (!checkValid()) return;
        }
        await updateSingle(id, { name, description }, getToken());
        changes = false;
        let file = { ...$activeImage, name, description };
        fetchMultiple(
            { parent: $activeParent.id, mimeType: IMG_MIME_TYPE },
            getToken(),
            true
        );
        fileStore.update((prev) => {
            return {
                nextPageToken: prev?.nextPageToken,
                files: prev?.files.map((f) => {
                    if (f.id === id) return file;
                    else return f;
                }),
            };
        });
    }
    function handleCancel() {
        name = $activeImage.name;
        description = $activeImage.description;
        changes = false;
        invalid = false;
    }

    function handleChange(e) {
        changes = true;
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

<!-- svelte-ignore a11y-no-static-element-interactions -->
<div
    class="info"
    on:wheel|preventDefault
    on:keydown|stopPropagation
    transition:fade={{ duration: 100 }}
>
    <header>
        <h5>Info</h5>
        <button class="btn s-prime close" on:click={() => dispatch("close")}
            >{@html closeIcon}</button
        >
    </header>

    <p class="id" title="id">{id}</p>
    <p class="size" title="size">
        {size}
    </p>
    <input
        type="text"
        name="name"
        title="file name"
        placeholder="Name"
        bind:value={name}
        on:change={handleChange}
        autocomplete="off"
    />
    <input
        type="url"
        name="url"
        title="link to website"
        class:invalid
        placeholder="URL"
        bind:value={description}
        on:change={handleChange}
        autocomplete="off"
    />

    {#if invalid}
        <p class="alert">Enter valid url</p>
    {/if}
    {#if changes}
        <footer>
            <button class="cancel action" on:click={handleCancel}>cancel</button
            >
            <button class="save action" on:click={handleSave}>save</button>
        </footer>
    {/if}
</div>

<style>
    h5 {
        font-size: var(--size-small);
    }
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .info {
        padding: 1rem 2rem;
        display: flex;
        flex-flow: column;
        justify-content: start;
        gap: 2rem;
        color: var(--color-three);
        background-color: var(--primary-bg-color);
        height: 100%;
        width: 100%;
        position: relative;
        border-radius: 1rem;
        border: 1px solid var(--color-file-border);
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
    .invalid,
    .invalid:focus {
        border-bottom: 2px solid #f00;
    }
    .id,
    .size {
        color: var(--bg-color-five);
        word-wrap: nowrap;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        max-width: 100%;
    }
    footer {
        position: absolute;
        bottom: 0;
        padding: 2rem;
        display: flex;
        justify-content: space-evenly;
        width: 90%;
    }

    .action {
        width: 10rem;
        padding: 0.5rem;
        border: 1px solid var(--color-file-border);
        border-radius: 0.5rem;
    }
    .action:hover {
        background-color: var(--bg-color-four);
    }
    .alert {
        color: #aaa;
        font-size: 1.3rem;
        user-select: none;
    }

    @media (max-width: 600px) {
        .info {
            border-radius: 0rem;
            border: none;
        }
        .id {
            max-width: 25rem;
        }
    }
</style>
