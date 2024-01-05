<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import closeIcon from "$lib/assets/close.svg?raw";
    import doneIcon from "$lib/assets/done.svg?raw";
    import toggleIcon from "$lib/assets/toggle.svg?raw";
    import doubleRightIcon from "$lib/assets/doubleRight.svg?raw";
    import {
        dropCloseHandler,
        dropOkHandler,
        // clearDropItems,
    } from "$lib/scripts/shared/image";
    import { dropItems } from "$lib/scripts/shared/stores";

    export let autosave;
    const dispatch = createEventDispatcher();
    function triggerDispatch(type: string) {
        dispatch(type);
    }
    export function clearDropItems() {
        const a = $dropItems.filter((item) => item.progress !== "success");
        dropItems.set(a);
    }
</script>

<div class="drop-tools">
    <span>
        <button
            class="drop-cancel btn"
            title="close"
            on:click={dropCloseHandler}
        >
            {@html closeIcon}
        </button><button
            class="btn"
            title="minimize"
            on:click={() => {
                triggerDispatch("mini");
            }}
        >
            {@html doubleRightIcon}
        </button>
    </span>
    <!-- <span class="drop-parent">parent</span> -->
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
            class="btn {autosave === true ? 'autosave' : ''}"
            title="toggle autosave"
            on:click={() => {
                triggerDispatch("auto");
            }}
        >
            {@html toggleIcon}
        </button><button class="drop-ok btn" on:click={dropOkHandler}>
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
        /* background-color: #eee; */
        z-index: 2;
    }
    .autosave :global(svg) {
        fill: red;
    }
    .autosave {
        filter: none;
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
