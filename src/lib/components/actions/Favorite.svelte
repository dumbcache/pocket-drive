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

<button
    class="btn s-second {starred && 'starred'}"
    on:click|stopPropagation={favStatus}
>
    {@html favoriteIcon}
</button>

<style>
    .btn :global(svg) {
        fill: var(--color-white-level-two);
    }
    .btn:hover :global(svg) {
        fill: var(--color-focus);
    }
    .btn:active :global(svg) {
        fill: red;
    }
    .starred :global(svg) {
        fill: red;
    }
    .starred:hover :global(svg) {
        fill: red;
    }
    @media (max-width: 600px) {
    }
</style>
