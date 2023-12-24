<script lang="ts">
    import { createEventDispatcher } from "svelte";
    import closeIcon from "$lib/assets/close.svg?raw";
    import doneIcon from "$lib/assets/done.svg?raw";
    import clearIcon from "$lib/assets/clear.svg?raw";
    import expandIcon from "$lib/assets/expand.svg?raw";
    import toggleIcon from "$lib/assets/toggle.svg?raw";
    import doubleRightIcon from "$lib/assets/doubleRight.svg?raw";
    import {
        dropCloseHandler,
        dropOkHandler,
        // clearDropItems,
    } from "$lib/scripts/utils";
    import {
        autosave,
        dropFull,
        dropItems,
        dropMini,
    } from "$lib/scripts/stores";

    export function clearDropItems() {
        const a = $dropItems.filter((item) => item.progress !== "success");
        dropItems.set(a);
    }
</script>

<div class="drop-tools">
    <button class="drop-cancel btn" title="close" on:click={dropCloseHandler}>
        {@html closeIcon}
    </button>
    <!-- <span class="drop-parent">parent</span> -->
    <input
        type="text"
        class="common-url"
        placeholder="common-url"
        value=""
        on:keydown|stopPropagation
    />
    <span>
        <button
            class="btn"
            title="minimize"
            on:click={() => {
                $dropMini = !$dropMini;
                $dropFull = false;
            }}
        >
            {@html doubleRightIcon}
        </button>

        <button
            class="btn {$autosave === true ? 'autosave' : ''}"
            title="toggle autosave"
            on:click={() => {
                $autosave = !$autosave;
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
        right: o;
        background-color: inherit;
        display: flex;
        align-items: center;
        padding: 1rem 0rem;
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
    @media (max-width: 600px) {
        .common-url {
            max-width: 15rem;
        }
    }
</style>
