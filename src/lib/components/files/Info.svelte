<script lang="ts">
    import { activeImage } from "$lib/scripts/shared/stores";
    import closeIcon from "$lib/assets/close.svg?raw";
    import { createEventDispatcher, onMount } from "svelte";

    const dispatch = createEventDispatcher();
    let changes = true;
    let file = { ...$activeImage };
    onMount(() => {
        return activeImage.subscribe((data) => (file = data));
    });
    function handleSave() {
        console.log(file.id, file.name, file.description);
    }
    function handleCancel() {
        file = { ...$activeImage };
        console.log(file);
    }
</script>

<div class="info" on:wheel|preventDefault on:keydown|stopPropagation>
    <header>
        <h5>Info</h5>
        <button class="btn close" on:click={() => dispatch("close")}
            >{@html closeIcon}</button
        >
    </header>
    <p class="id">{file.id}</p>
    <!-- <hr /> -->
    <input type="text" placeholder="Name" bind:value={file.name} />
    <input
        type="url"
        name=""
        id=""
        placeholder="URL"
        bind:value={file.description}
    />
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
        background-color: var(--color-black-three);
        height: 100%;
        width: 100%;
        position: relative;
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
    .id {
        color: var(--color-black-level-six);
        /* background-color: var(--bg-color-two); */
        /* padding: 1rem 0rem; */
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
    }
    .action:hover {
        background-color: var(--bg-color-four);
    }
</style>
