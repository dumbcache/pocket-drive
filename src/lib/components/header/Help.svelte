<script>
    import helpIcon from "$lib/assets/help.svg?raw";
    import profileIcon from "$lib/assets/profile.svg?raw";
    import goToDrive from "$lib/assets/drive.svg?raw";
    import { states, tempStore } from "$lib/scripts/stores.svelte";
</script>

<div class="wrapper">
    <button
        class="btn shortcuts"
        title="shortcuts"
        onclick={() => (states.shortcuts = true)}>{@html helpIcon}</button
    >
    <a
        href={`https://drive.google.com/drive/folders/${tempStore.activeFolder?.id}`}
        referrerpolicy="no-referrer"
        rel="external noopener noreferrer nofollow"
        class="btn s-prime"
        title="open in google drive"
        target="_blank"
    >
        {@html goToDrive}
    </a>
    <button
        class="btn s-prime settings"
        title="settings"
        onclick={() => (states.profile = true)}>{@html profileIcon}</button
    >
</div>

<style>
    .wrapper {
        display: flex;
        gap: 2rem;
        align-items: center;
    }
    .shortcuts {
        width: 2rem;
        height: 2rem;
    }
    @media (max-width: 600px) {
        .shortcuts {
            display: none;
        }
    }
</style>
