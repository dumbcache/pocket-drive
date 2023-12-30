<script lang="ts">
    import closeIcon from "$lib/assets/close.svg?raw";
</script>

<div class="info">
    <header>
        <h5>Info</h5>
    </header>
    <input type="text" placeholder="Name" />
    <input type="url" name="" id="" placeholder="URL" />
</div>

<style>
    header {
        display: flex;
        align-items: center;
    }
    .info {
        padding: 0rem 2rem;
        display: flex;
        flex-flow: column;
        justify-content: start;
        gap: 2rem;
        background-color: var(--color-black-three);
        height: 100%;
    }
    input {
        background: unset;
        padding: 0.5rem;
        border: none;
        border-bottom: 1px solid var(--color-focus);
    }
</style>
