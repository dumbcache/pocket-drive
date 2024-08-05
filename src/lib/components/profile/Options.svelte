<script>
    import ToggleButton from "$lib/components/utils/ToggleButton.svelte";
    import { onDestroy } from "svelte";
    import { preferences } from "$lib/scripts/state.svelte";

    onDestroy(() => {
        preferences.saveToLocal();
    });
</script>

<ul class="options">
    <li>
        <div>Display filenames</div>
        <button onclick={() => preferences.toggleShowFileNames()}>
            <ToggleButton bool={preferences.showFileNames} />
        </button>
    </li>
    <li>
        <div>Disable WebP conversion</div>
        <button onclick={() => preferences.toggleWebp()}>
            <ToggleButton bool={preferences.disableWebp} />
        </button>
    </li>
</ul>

<style>
    ul {
        display: flex;
        flex-flow: column;
        gap: 1rem;
    }

    li {
        display: flex;
        justify-content: space-between;
        align-items: center;
    }
</style>
