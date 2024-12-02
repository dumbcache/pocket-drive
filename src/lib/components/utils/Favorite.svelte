<script lang="ts">
    import favoriteIcon from "$lib/assets/favorite.svg?raw";
    import { updateSingle } from "$lib/scripts/utils";
    import { getToken } from "$lib/scripts/login";

    let {
        id,
        starred,
        toggle,
        fill = "var(--color-lite)",
        stroke = "none",
        strokeWidth = 50,
    }: {
        id: string;
        starred: Boolean;
        toggle: Function;
        fill?: string;
        stroke?: string;
        strokeWidth?: number;
    } = $props();

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
    style="--color-fill:{fill};--color-stroke:{stroke};--stroke-width:{strokeWidth}"
    onclick={update}
>
    {@html favoriteIcon}
</button>

<style>
    .btn {
        background: none;
    }
    .btn :global(svg) {
        fill: var(--color-fill);
        stroke-width: var(--stroke-width);
        stroke: var(--color-stroke);
    }
    .starred :global(svg) {
        fill: var(--color-red);
        stroke: none;
    }
    .btn:active :global(svg) {
        fill: var(--color-focus);
    }

    @media (max-width: 600px) {
    }
</style>
