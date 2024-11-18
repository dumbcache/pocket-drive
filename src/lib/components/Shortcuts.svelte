<script>
    import { states } from "$lib/scripts/stores.svelte";
    import { onMount } from "svelte";
    import { disableScrolling, enableScorlling } from "$lib/scripts/utils";

    onMount(() => {
        disableScrolling();
        return () => enableScorlling();
    });
</script>

<!-- svelte-ignore a11y_click_events_have_key_events -->
<!-- svelte-ignore a11y_no_static_element_interactions -->
<div class="shortcuts" onclick={() => (states.shortcuts = false)}>
    <!-- svelte-ignore a11y_no_noninteractive_element_interactions -->
    <ul onclick={(e) => e.stopPropagation()}>
        <li>
            <span class="l">Escape</span>:<span class="r">Close popups</span>
        </li>
        <li>
            <span class="l">A, Shift + A</span>:<span class="r"
                >Mask content</span
            >
        </li>
        <li>
            <span class="l">C, Shift + C</span>:<span class="r"
                >Change theme</span
            >
        </li>
        <li>
            <span class="l">D, ShDft + d</span>:<span class="r"
                >filter to Favourites</span
            >
        </li>
        <li>
            <span class="l">E</span>:<span class="r">Toggle view</span>
        </li>
        <li>
            <span class="l">Shift + E</span>:<span class="r">Edit mode</span>
        </li>
        <li>
            <span class="l">H, Shift + H</span>:<span class="r">Shortcuts</span>
        </li>
        <li>
            <span class="l">S, Shift + S</span>:<span class="r"
                >Search in present folder</span
            >
        </li>
    </ul>
</div>

<style>
    .shortcuts {
        display: grid;
        place-content: center;
        position: fixed;
        top: 0;
        bottom: 0;
        right: 0;
        left: 0;
        width: 100%;
        z-index: 5;
        background-color: var(--color-backdrop);
    }
    ul {
        background-color: var(--color-bg-one);
        width: max-content;
        padding: 3rem;
        border-radius: 1rem;
        box-shadow: 0 0 50px -10px var(--color-black);
    }
    li {
        list-style-type: none;
        padding-bottom: 1rem;
    }
    .l {
        display: inline-block;
        width: 10rem;
        max-width: 10rem;
    }
    .r {
        padding-left: 1rem;
    }

    @media (max-width: 600px) {
        .shortcuts {
            display: none;
        }
    }
</style>
