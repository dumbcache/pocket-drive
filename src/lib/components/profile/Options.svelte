<script>
    import ToggleButton from "$lib/components/utils/ToggleButton.svelte";
    import { onDestroy } from "svelte";
    import { preferences, PRIVATE_PATH } from "$lib/scripts/stores.svelte";

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
    <li>
        <div>Show hidden folders</div>
        <button onclick={() => preferences.toggleHidden()}>
            <ToggleButton bool={preferences.showHidden} />
        </button>
    </li>
    <li>
        <a href={PRIVATE_PATH}>Private</a>
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
