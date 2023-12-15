<script lang="ts">
    import deleteIcon from "$lib/assets/deleteOutline.svg?raw";
    import closeIcon from "$lib/assets/close.svg?raw";
    import moveIcon from "$lib/assets/move.svg?raw";
    import editIcon from "$lib/assets/editOutline.svg?raw";
    import selectallIcon from "$lib/assets/selectall.svg?raw";
    import {
        editItems,
        selectedCount,
        editConfirm,
        mode,
        editMode,
        activeImgs,
        selectAll,
    } from "$lib/scripts/stores";
</script>

<div class="edit-mode">
    <p>seleted : {$selectedCount}</p>
    <div class="edit-buttons">
        <button
            class="delelte-button btn"
            title="select all"
            on:click={() => {
                $selectAll = !$selectAll;
                $selectedCount = $selectAll === true ? $activeImgs.length : 0;
                $editItems =
                    $selectAll === true ? $activeImgs.map((img) => img.id) : [];
            }}>{@html selectallIcon}</button
        >
        <button
            class="edit-button btn"
            title="edit"
            disabled={$selectedCount === 0}
            on:click={() => {
                $mode = "edit";
            }}>{@html editIcon}</button
        >
        <button
            class="move-button btn"
            title="move"
            disabled={$selectedCount === 0}
            on:click={() => {
                if ($selectedCount !== 0) {
                    $mode = "move";
                }
            }}>{@html moveIcon}</button
        >
        <button
            class="delelte-button btn"
            disabled={$selectedCount === 0}
            title="delete forever"
            on:click={() => {
                $mode = "delete";
                $editConfirm = true;
                // $selectAll = false;
            }}>{@html deleteIcon}</button
        >
        <button
            class="btn"
            title="close"
            on:click={() => {
                $mode = "";
                $editMode = false;
                $selectedCount = 0;
                $selectAll = false;
                $editItems = [];
            }}>{@html closeIcon}</button
        >
    </div>
</div>

<style>
    .edit-mode {
        position: sticky;
        top: 0rem;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 2rem;
        padding: 2rem 5rem;
        background-color: var(--primary-bg-color);
        z-index: 1;
    }
    .edit-buttons {
        display: flex;
        align-items: center;
        gap: 2rem;
    }

    .btn:disabled :global(svg),
    .btn:disabled {
        cursor: not-allowed;
    }
    @media (max-width: 600px) {
        .edit-mode {
            padding: 1rem 1rem;
        }
        .edit-buttons {
            gap: 1.5rem;
        }
    }
</style>
