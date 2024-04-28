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
    <button class="btn s-second expand" on:click|stopPropagation>
        {@html expandIcon}
    </button>
    <button
        class="btn s-second action"
        title="edit folder"
        on:click|stopPropagation={() => handler("EDIT")}
    >
        {@html editIcon}
    </button>
    <button
        class="btn s-second action"
        title="move folder"
        on:click|stopPropagation={() => handler("MOVE")}
    >
        {@html moveIcon}
    </button>
    <button
        class="btn s-second action"
        title="delete folder"
        on:click|stopPropagation={() => handler("DELETE")}
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
    .edit-tools:hover {
        height: initial;
        background-color: var(--color-black-light);
        border-radius: 5rem;
        outline: 1px solid var(--color-focus);
        backdrop-filter: blur(2px);
        -webkit-backdrop-filter: blur(2px);
    }

    .btn :global(svg) {
        fill: var(--color-white);
    }
    .btn:hover :global(svg) {
        fill: var(--color-focus);
    }
    .edit-tools:hover .expand {
        display: none;
    }
    .edit-tools:hover .action {
        visibility: initial;
        opacity: 1;
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
        }
    }
</style>
