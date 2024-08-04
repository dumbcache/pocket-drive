<script>
    import ToggleButton from "$lib/components/utils/ToggleButton.svelte";
    import { onDestroy } from "svelte";
    import { appPreferences } from "$lib/scripts/state.svelte";

    onDestroy(() => {
        window.localStorage.setItem(
            "preferences",
            JSON.stringify({
                showFileNames: appPreferences.showFileNames,
                disableWebp: appPreferences.disableWebp,
                theme: appPreferences.theme,
            })
        );
    });
</script>

<ul class="options">
    <li>
        <div>Display filenames</div>
        <button onclick={() => appPreferences.toggleShowFileNames()}>
            <ToggleButton bool={appPreferences.showFileNames} />
        </button>
    </li>
    <li>
        <div>Disable WebP conversion</div>
        <button onclick={() => appPreferences.toggleWebp()}>
            <ToggleButton bool={appPreferences.disableWebp} />
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
