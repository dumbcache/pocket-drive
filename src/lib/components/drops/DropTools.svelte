<script lang="ts">
    import closeIcon from "$lib/assets/close.svg?raw";
    import doneIcon from "$lib/assets/done.svg?raw";
    import toggleIcon from "$lib/assets/toggle.svg?raw";
    import pasteIcon from "$lib/assets/paste.svg?raw";
    import doubleRightIcon from "$lib/assets/arrowRightDouble.svg?raw";
    import expandIcon from "$lib/assets/expand.svg?raw";
    import { dropOkHandler, previewAndSetDropItems } from "$lib/scripts/image";
    import { states, tempStore } from "$lib/scripts/stores.svelte";
    import type { MouseEventHandler } from "svelte/elements";

    let {
        onMini,
        onExpand,
    }: {
        onMini: MouseEventHandler<HTMLButtonElement>;
        onExpand: MouseEventHandler<HTMLButtonElement>;
    } = $props();

    export function clearDropItems() {
        tempStore.dropItems = tempStore.dropItems.filter(
            (item) => item.progress !== "success"
        );
    }

    export function dropCloseHandler() {
        const running = tempStore.dropItems.filter(
            (item) => item.progress === "uploading"
        );
        if (running.length === 0) {
            tempStore.dropItems = [];
            states.autosave = false;
            states.drop = false;
        } else {
            onMini();
        }
    }

    async function readImage() {
        const clipboardItems = await navigator.clipboard.read();
        console.log(clipboardItems);
        if (!clipboardItems) return;
        for (const item of clipboardItems) {
            if (item.types.some((type) => type.startsWith("image/"))) {
                const blob = await item.getType(
                    item.types.find((type) => type.startsWith("image/"))
                );
                let file = new File([blob], "image" + blob.type.split("/")[1], {
                    type: blob.type,
                });
                if (file) {
                    const dataTransfer = new DataTransfer();
                    dataTransfer.items.add(file);
                    previewAndSetDropItems(dataTransfer.files);
                }
                break;
            }
        }
    }
</script>

<div class="drop-tools">
    <span>
        <button class="btn s-prime" title="close" onclick={dropCloseHandler}>
            {@html closeIcon}
        </button><button
            class="btn s-prime expand"
            title="minimize"
            onclick={onExpand}
        >
            {@html expandIcon}
        </button>
        <button class="btn s-prime" title="minimize" onclick={onMini}>
            {@html doubleRightIcon}
        </button>
        <button class="btn s-prime" title="pasteimage" onclick={readImage}>
            {@html pasteIcon}
        </button>
    </span>
    <input
        type="text"
        class="common-url"
        placeholder="common-url"
        bind:value={tempStore.dropURL}
        onkeydown={(e) => e.stopPropagation()}
        onclick={(e) => e.target.select()}
    />
    <span>
        <button
            class="btn s-prime {states.autosave === true ? 'autosave' : ''}"
            title="toggle autosave"
            onclick={() => {
                states.autosave = !states.autosave;
            }}
        >
            {@html toggleIcon}
        </button><button class="btn s-prime" onclick={dropOkHandler}>
            {@html doneIcon}
        </button>
    </span>
</div>

<style>
    .drop-tools {
        position: sticky;
        top: 0;
        right: 0;
        display: flex;
        align-items: center;
        padding: 3rem 0rem;
        justify-content: space-between;
        justify-self: start;
        z-index: 2;
        backdrop-filter: blur(1rem);
        -webkit-backdrop-filter: blur(1rem);
        gap: 2rem;
        width: 100%;
    }
    input {
        border-radius: 2.5rem;
        padding: 1rem 1.5rem;
    }
    .autosave :global(svg) {
        fill: red;
    }

    .common-url {
        max-width: 30rem;
    }
    button {
        display: inline-flex;
        align-items: center;
        justify-content: center;
    }
    span {
        display: inline-flex;
        gap: 1rem;
    }
    @media (max-width: 600px) {
        .common-url {
            max-width: 15rem;
        }
        .drop-tools {
            padding: 1rem 0rem;
        }
        .expand {
            display: none;
        }
    }
</style>
