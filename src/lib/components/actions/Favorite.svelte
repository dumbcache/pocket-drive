<script lang="ts">
    import { updateResource } from "$lib/scripts/gdrive/utils";
    import favoriteIcon from "$lib/assets/favorite.svg?raw";
    import { createEventDispatcher } from "svelte";
    import { getToken } from "$lib/scripts/shared/utils";

    export let id: string;
    export let starred: Boolean;

    const dispatch = createEventDispatcher();
    function favStatus() {
        dispatch("favStatus");
    }
</script>

<button
    class="btn {starred && 'starred'}"
    on:click|stopPropagation={() => {
        updateResource(id, { starred: !starred }, getToken()).then(
            ({ status }) => {
                if (status === 200) favStatus();
            }
        );
    }}
>
    {@html favoriteIcon}
</button>

<style>
    .btn {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 100%;
        display: block;
    }
    .btn :global(svg) {
        stroke: var(--color-black);
        stroke-width: 2rem;
        fill: var(--color-white-level-one);
    }
    .starred :global(svg) {
        fill: red;
    }
</style>
