<script lang="ts">
    import expandIcon from "$lib/assets/expandDown.svg?raw";
    import editIcon from "$lib/assets/edit.svg?raw";
    import deleteIcon from "$lib/assets/delete.svg?raw";
    import moveIcon from "$lib/assets/moveOutline.svg?raw";
    import { createEventDispatcher } from "svelte";

    export let type: "dir" | "img";
    export let id: string;
    export let name: string;

    const dispatch = createEventDispatcher();
    function editHandler() {
        dispatch("editDir", { id, name });
    }
    function deleteHandler() {
        dispatch("deleteDir", { id });
    }
</script>

<div class="edit-tools">
    <button class="btn expand" on:click|stopPropagation>
        {@html expandIcon}
    </button>
    <button
        class="btn action"
        title="edit"
        on:click|stopPropagation={editHandler}
    >
        {@html editIcon}
    </button>
    <button
        class="btn action"
        title="move"
        on:click|stopPropagation={editHandler}
    >
        {@html moveIcon}
    </button>
    <button
        class="btn action"
        title="delete"
        on:click|stopPropagation={deleteHandler}
    >
        {@html deleteIcon}
    </button>
</div>

<style>
    .edit-tools {
        padding: 0.5rem 0.2rem;
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        display: flex;
        flex-flow: column nowrap;
        gap: 0.5rem;
        height: 4rem;
        overflow: hidden;
    }
    .btn {
        display: flex;
        align-items: center;
        justify-content: center;
    }
    .btn:hover :global(svg) {
        fill: var(--color-focus);
    }
    .btn :global(svg) {
        stroke: var(--color-black);
        stroke-width: 1rem;
        fill: var(--color-white-level-one);
        width: var(--secondary-icon-size);
    }
    .edit-tools:hover .expand {
        display: none;
    }
    .edit-tools:hover .action {
        visibility: initial;
        opacity: 1;
    }
    .edit-tools:hover {
        height: initial;
        background-color: #0005;
        border-radius: 5rem;
        outline: 1px solid var(--color-focus);
    }
    .action {
        visibility: hidden;
        opacity: 0;
        transition: opacity 0.5s linear;
    }
    @media (max-width: 600px) {
        .edit-tools {
            top: 0;
            right: 0;
            gap: 0;
        }
    }
</style>
