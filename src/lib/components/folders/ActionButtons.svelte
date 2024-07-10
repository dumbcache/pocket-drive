<script lang="ts">
    import expandIcon from "$lib/assets/expandDown.svg?raw";
    import editIcon from "$lib/assets/edit.svg?raw";
    import deleteIcon from "$lib/assets/delete.svg?raw";
    import moveIcon from "$lib/assets/move.svg?raw";
    import { folderAction, folderActionDetail } from "$lib/scripts/stores";

    export let id: string;
    export let name: string;

    function handler(type: FolderAction) {
        $folderAction = type;
        $folderActionDetail = { id, name };
    }
</script>

<div class="edit-tools">
    <button
        class="btn s-second action"
        title="edit folder"
        on:click|stopPropagation|preventDefault={() => handler("EDIT")}
    >
        {@html editIcon}
    </button>
    <button
        class="btn s-second action"
        title="move folder"
        on:click|stopPropagation|preventDefault={() => handler("MOVE")}
    >
        {@html moveIcon}
    </button>
    <button
        class="btn s-second action"
        title="delete folder"
        on:click|stopPropagation|preventDefault={() => handler("DELETE")}
    >
        {@html deleteIcon}
    </button>
    <button class="btn s-second expand" on:click|stopPropagation|preventDefault>
        {@html expandIcon}
    </button>
</div>

<style>
    .expand {
        transform: rotate(90deg);
    }
    .edit-tools {
        padding: 0.5rem 0.5rem;
        position: absolute;
        top: 0.5rem;
        right: 0.5rem;
        display: flex;
        flex-flow: rwo nowrap;
        gap: 0.7rem;
        overflow: hidden;
    }
    .edit-tools:hover {
        /* background-color: var(--color-black-light); */
        /* outline: 1px solid var(--color-focus); */
        background-color: var(--color-bg-one);
        outline: 1px solid var(--color-border);
        border-radius: 5rem;
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
    }

    .expand :global(svg) {
        fill: var(--color-white);
    }
    .btn:hover :global(svg) {
        fill: var(--color-blue);
    }
    .edit-tools:hover .expand :global(svg) {
        /* display: none; */
        /* visibility: hidden; */
        fill: var(--color-focus);
    }
    .edit-tools:hover .action {
        /* visibility: initial;
        opacity: 1; */
        display: initial;
    }

    .action {
        display: none;
        /* visibility: hidden;
        opacity: 0;
        transition: opacity 0.5s linear; */
    }

    @media (max-width: 600px) {
        .edit-tools {
            right: 0;
        }
    }
</style>
