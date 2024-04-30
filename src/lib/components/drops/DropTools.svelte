<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import closeIcon from "$lib/assets/close.svg?raw";
    import doneIcon from "$lib/assets/done.svg?raw";
    import toggleIcon from "$lib/assets/toggle.svg?raw";
    import doubleRightIcon from "$lib/assets/arrowRightDouble.svg?raw";
    import { dropOkHandler } from "$lib/scripts/image";
    import { autosave, dropItems } from "$lib/scripts/stores";

    const dispatch = createEventDispatcher();
    function triggerDispatch(type: string) {
        dispatch(type);
    }
    export function clearDropItems() {
        const a = $dropItems.filter((item) => item.progress !== "success");
        dropItems.set(a);
    }

    export function dropCloseHandler() {
        const running = $dropItems.filter(
            (item) => item.progress === "uploading"
        );
        if (running.length === 0) {
            $dropItems = [];
            $autosave = false;
        } else {
            triggerDispatch("mini");
        }
    }
</script>

<div class="drop-tools">
    <span>
        <button class="btn s-prime" title="close" on:click={dropCloseHandler}>
            {@html closeIcon}
        </button><button
            class="btn s-prime"
            title="minimize"
            on:click={() => {
                triggerDispatch("mini");
            }}
        >
            {@html doubleRightIcon}
        </button>
    </span>
    <input
        type="text"
        class="common-url"
        placeholder="common-url"
        value=""
        on:keydown|stopPropagation
        on:click={(e) => e.target.select()}
    />
    <span>
        <button
            class="btn s-prime {$autosave === true ? 'autosave' : ''}"
            title="toggle autosave"
            on:click={() => {
                $autosave = !$autosave;
            }}
        >
            {@html toggleIcon}
        </button><button class="btn s-prime" on:click={dropOkHandler}>
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
        padding: 2rem 0rem;
        justify-content: space-between;
        justify-self: start;
        z-index: 2;
        background-color: var(--primary-bg-color);
    }
    .autosave :global(svg) {
        fill: red;
    }

    .common-url {
        max-width: 20rem;
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
    }
</style>
