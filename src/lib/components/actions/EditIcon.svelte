<script lang="ts">
    import editIcon from "$lib/assets/editMode.svg?raw";
    import { editMode, mode } from "$lib/scripts/stores";
</script>

<button
    class="edit-button btn"
    title="edit mode"
    on:click={() => {
        $editMode = true;
        $mode = "select";
    }}
>
    {@html editIcon}
</button>
