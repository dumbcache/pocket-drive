<script lang="ts">
    import closeIcon from "$lib/assets/close.svg?raw";
    import { getToken } from "$lib/scripts/login";
    import {
        isValidUrl,
        IMG_MIME_TYPE,
        fetchMultiple,
        updateSingle,
    } from "$lib/scripts/utils";
    import { fade } from "svelte/transition";
    import { tempStore } from "$lib/scripts/stores.svelte";

    let { toggleInfo }: { toggleInfo: MouseEventHandler<HTMLButtonElement> } =
        $props();

    let name = $state("");
    let description = $state("");

    let invalid = $state(false);
    let changes = $state(false);

    $effect(() => {
        name = tempStore.activeFile.name;
        description = tempStore.activeFile.description;
    });

    async function handleSave() {
        if (description) {
            if (!checkValid(description)) return;
        }
        let id = tempStore.activeFile.id;
        await updateSingle(
            id,
            {
                name,
                description,
            },
            getToken()
        );
        changes = false;
        fetchMultiple(
            { parent: id, mimeType: IMG_MIME_TYPE },
            getToken(),
            true
        );
        tempStore.activeFile.name = name;
        tempStore.activeFile.description = description;
    }

    function handleCancel() {
        changes = false;
        invalid = false;
    }

    function handleChange(e) {
        changes = true;
        e.target.name = "url" && checkValid(description);
    }

    function checkValid(url: string) {
        if (url.trim() === "") {
            invalid = false;
            return;
        }
        url = isValidUrl(url);
        if (!url) {
            invalid = true;
            return false;
        }
        invalid = false;
        return true;
    }
</script>

<section class="three">
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <!-- svelte-ignore a11y_no_static_element_interactions -->
    <div
        class="info"
        onwheel={(e) => e.preventDefault()}
        onkeydown={(e) => e.stopPropagation()}
        transition:fade={{ duration: 100 }}
    >
        <header>
            <h5>Info</h5>
            <button class="btn s-prime close" onclick={toggleInfo}
                >{@html closeIcon}</button
            >
        </header>

        <p class="id" title="id">{tempStore.activeFile.id}</p>
        <p class="size" title="size">
            {(tempStore.activeFile.size / (1024 * 1024)).toFixed(2)} MB
        </p>
        <input
            type="text"
            name="name"
            title="file name"
            placeholder="Name"
            bind:value={name}
            onchange={handleChange}
            autocomplete="off"
        />
        <input
            type="url"
            name="url"
            title="link to website"
            class:invalid
            placeholder="URL"
            bind:value={description}
            onchange={handleChange}
            autocomplete="off"
        />

        {#if invalid}
            <p class="alert">Enter valid url</p>
        {/if}
        {#if changes}
            <footer>
                <button class="cancel action" onclick={handleCancel}
                    >cancel</button
                >
                <button class="save action" onclick={handleSave}>save</button>
            </footer>
        {/if}
    </div>
</section>

<style>
    h5 {
        font-size: var(--size-small);
        font-weight: 700;
    }
    header {
        display: flex;
        align-items: center;
        justify-content: space-between;
    }
    .info {
        padding: 2rem 2rem 0rem;
        display: flex;
        flex-flow: column;
        justify-content: start;
        gap: 2rem;
        background-color: var(--color-popup);
        box-shadow: -10px 5px 15px 0px var(--color-shadow);
        height: 95%;
        width: 100%;
        position: relative;
        top: 50%;
        transform: translateY(-50%);
        border-radius: 1rem;
        font-size: 1.3rem;
        overflow: hidden;
        /* border: 1px solid var(--color-lite); */
    }
    input {
        background: unset;
        border: none;
        /* border-bottom: 1px solid var(--color-focus); */
        background-color: inherit;
        filter: invert(0.1);
        padding: 1rem;
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
    }
    input:active,
    input:focus {
        border-bottom: 2px solid var(--color-focus);
        outline: none;
    }
    .invalid,
    .invalid:focus {
        border-bottom: 2px solid var(--color-red);
    }
    .id,
    .size {
        word-wrap: nowrap;
        white-space: nowrap;
        overflow: hidden;
        text-overflow: ellipsis;
        width: 35rem;
    }
    footer {
        position: absolute;
        bottom: 0rem;
        left: 0rem;
        display: flex;
        justify-content: space-evenly;
        width: 100%;
    }

    .action {
        width: 100%;
        padding: 1rem 0rem;
        border-top: 1px solid var(--color-lite);
        background-color: var(--color-bg-one);
        /* border-radius: 0.5rem; */
    }
    .action:hover {
        /* background-color: inherit; */
        filter: invert(0.1);
    }

    .save {
        border-left: 1px solid var(--color-lite);
    }
    .alert {
        color: var(--color-red);
        font-size: 1.3rem;
        user-select: none;
    }

    @media (max-width: 600px) {
        .info {
            border-radius: 0rem;
            border: none;
            padding: 2rem 3rem;
            height: 100%;
        }
        .id {
            max-width: 25rem;
        }
        footer {
            bottom: 0;
        }
    }
</style>
