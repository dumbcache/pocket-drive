<script lang="ts">
    import favoriteIcon from "$lib/assets/favorite.svg?raw";
    import { createEventDispatcher } from "svelte";
    import { getToken, updateSingle } from "$lib/scripts/utils";

    export let id: string;
    export let starred: Boolean;

    const dispatch = createEventDispatcher();
    function favStatus() {
        updateSingle(id, { starred: !starred }, getToken()).then(
            ({ status }) => {
                if (status === 200) {
                    dispatch("fav");
                    // const ele = document.querySelector(`[data-id="${id}"]`);
                    // let { starred } = ele.dataset;
                    // ele.dataset.starred = starred === "true" ? "false" : "true";
                }
            }
        );
    }
</script>

<button
    class="favorite btn s-second {starred && 'starred'}"
    on:click|stopPropagation={favStatus}
>
    {@html favoriteIcon}
</button>

<style>
    .btn :global(svg) {
        fill: var(--color-svg-one);
    }

    .btn:active :global(svg) {
        fill: var(--color-red);
    }
    .starred :global(svg) {
        fill: var(--color-red);
    }
    .starred:hover :global(svg) {
        fill: var(--color-red);
    }
    @media (max-width: 600px) {
    }
</style>
