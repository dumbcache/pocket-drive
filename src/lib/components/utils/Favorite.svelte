<script lang="ts">
    import favoriteIcon from "$lib/assets/favorite.svg?raw";
    import { updateSingle } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";

    let {
        id,
        starred,
        toggle,
    }: { id: string; starred: Boolean; toggle: Function } = $props();

    function update(e: MouseEvent) {
        e.stopPropagation();
        updateSingle(id, { starred: !starred }, getToken()).then(
            ({ status }) => {
                if (status === 200) {
                    toggle();
                }
            }
        );
    }
</script>

<button
    aria-label="favorite"
    class="favorite btn s-second {starred && 'starred'}"
    onclick={update}
>
    {@html favoriteIcon}
</button>

<style>
    .btn {
        background: none;
    }
    .btn :global(svg) {
        fill: var(--color-lite);
    }
    .starred :global(svg) {
        fill: var(--color-red);
    }
    .btn:active :global(svg) {
        fill: var(--color-focus);
    }

    @media (max-width: 600px) {
    }
</style>
