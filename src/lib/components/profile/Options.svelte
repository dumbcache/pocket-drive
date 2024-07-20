<script>
    import { preferences, updatePreferences } from "$lib/scripts/stores";
    import ToggleButton from "$lib/components/utils/ToggleButton.svelte";
    import { onDestroy } from "svelte";
    let showFileNames = false;
    let disableWebp = false;

    const unsubscribePreferences = preferences.subscribe((val) => {
        showFileNames = val?.showFileNames;
        disableWebp = val?.disableWebp;
    });

    onDestroy(() => {
        window.localStorage.setItem(
            "preferences",
            JSON.stringify($preferences)
        );
        unsubscribePreferences();
    });
</script>

<ul class="options">
    <li>
        <div>Display filenames</div>
        <button
            on:click={() =>
                updatePreferences({
                    showFileNames: !showFileNames,
                })}
        >
            <ToggleButton bool={showFileNames} />
        </button>
    </li>
    <li>
        <div>Disable WebP conversion</div>
        <button
            on:click={() =>
                updatePreferences({
                    disableWebp: !disableWebp,
                })}
        >
            <ToggleButton bool={disableWebp} />
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
