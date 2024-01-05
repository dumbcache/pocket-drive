<script lang="ts">
    import { updateSingle } from "$lib/scripts/gdrive/utils";
    import favoriteIcon from "$lib/assets/favorite.svg?raw";
    import { createEventDispatcher } from "svelte";
    import { getToken } from "$lib/scripts/shared/utils";

    export let id: string;
    export let starred: Boolean;

    const dispatch = createEventDispatcher();
    function favStatus() {
        updateSingle(id, { starred: !starred }, getToken()).then(
            ({ status }) => {
                if (status === 200) dispatch("fav");
            }
        );
    }
</script>

<button class="btn {starred && 'starred'}" on:click|stopPropagation={favStatus}>
    {@html favoriteIcon}
</button>

<style>
    .btn {
        width: var(--size-medium);
        height: var(--size-medium);
    }
    .btn :global(svg) {
        fill: var(--color-white-level-one);
    }
    .starred :global(svg) {
        fill: red;
    }
    @media (max-width: 600px) {
        .btn {
            width: var(--size-default);
            height: var(--size-default);
        }
    }
</style>
