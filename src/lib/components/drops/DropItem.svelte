<script lang="ts">
    import closeIcon from "$lib/assets/close.svg?raw";
    import doneIcon from "$lib/assets/done.svg?raw";
    import successIcon from "$lib/assets/success.svg?raw";
    import failureIcon from "$lib/assets/failure.svg?raw";
    import { dropOkHandlerSingle, removeDropEntry } from "$lib/scripts/image";
    import Spinner from "$lib/components/utils/Spinner.svelte";

    let { item }: { item: DropItem } = $props();
</script>

<div class="drop-item" data-id={item.id}>
    <div class="img-wrapper">
        {#if item?.mimeType?.match("image/")}
            <img src={item.imgRef} class="drop-img" alt="" />
        {:else if item?.mimeType?.match("video/")}
            <video src={item.imgRef} muted class="drop-img"></video>
        {/if}
        {#if item.progress}
            <div class="progress">
                {#if item?.progress === "uploading"}
                    <Spinner borderWidth="2px" width="3rem" height="3rem" />
                    <div class="progress-count">0%</div>
                {:else if item?.progress === "success"}
                    <div class="status">{@html successIcon}</div>
                {:else}
                    <div class="status">{@html failureIcon}</div>
                {/if}
            </div>
        {/if}
    </div>
    {#if item?.progress !== "uploading" && item?.progress !== "success" && item?.loaded === true}
        <button
            class="remove btn s-second"
            onclick={() => removeDropEntry(item.id)}
        >
            {@html closeIcon}
        </button>
        <button
            class="done btn s-second"
            onclick={() => {
                dropOkHandlerSingle(item.id);
            }}
        >
            {@html doneIcon}
        </button>
        <input
            type="text"
            class="parent"
            disabled
            value={item.parentName}
            onkeydown={(e) => e.stopPropagation()}
            onclick={(e) => e.target.select()}
        />
        <input
            type="text"
            class="name"
            placeholder="name"
            bind:value={item.name}
            onkeydown={(e) => e.stopPropagation()}
            onclick={(e) => e.target.select()}
        />
        <input
            type="text"
            class="url"
            placeholder="url"
            bind:value={item.url}
            onkeydown={(e) => e.stopPropagation()}
            onclick={(e) => e.target.select()}
        />
    {/if}
</div>

<style>
    .drop-item {
        display: flex;
        flex-flow: column nowrap;
        position: relative;
        border-radius: 1rem;
        max-width: 15rem;
        border-bottom: none;
        border: 1px solid var(--color-lite);
        overflow: hidden;
    }
    .img-wrapper {
        display: flex;
        margin: auto;
    }
    .drop-img {
        max-height: 20rem;
        max-width: 100%;
        object-fit: contain;
        object-position: top;
        border-top-left-radius: 0.5rem;
        border-top-right-radius: 0.5rem;
        filter: brightness(0.8);
    }

    input {
        padding: 0.5rem;
    }
    .drop-item:hover .drop-img {
        filter: brightness(0.5);
    }

    .btn {
        position: absolute;
        top: 0.5rem;
        z-index: 1;
    }
    .remove {
        left: 0.5rem;
    }
    .done {
        right: 0.5rem;
    }
    .btn :global(svg) {
        fill: var(--color-white);
    }
    .btn:hover :global(svg) {
        fill: var(--color-focus);
    }

    .name {
        border-bottom: 1px solid var(--color-lite);
    }
    .progress {
        border-radius: 1rem;
        display: grid;
        place-content: center;
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background-color: var(--color-black-lite);
    }
    .progress-count {
        color: white;
        position: absolute;
        top: 50%;
        left: 50%;
        transform: translate(-50%, -50%);
        font-size: 0.8rem;
    }
    .status {
        width: var(--primary-icon-size);
        height: var(--primary-icon-size);
    }
    @media (max-width: 600px) {
        .drop-item {
            max-width: 45%;
        }
        .drop-img {
            max-height: 15rem;
        }
    }
</style>
