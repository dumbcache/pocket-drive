<script lang="ts">
    export let bool = false;
</script>

<div class="toggle" class:on={bool}>
    <span class="s-second" class:hidden={bool}></span>
    <span class="s-second" class:hidden={!bool}></span>
</div>

<style>
    .toggle {
        width: fit-content;
        background-color: var(--color-bg-six);
        display: flex;
        justify-content: space-between;
        align-items: center;
        border-radius: 5rem;
    }
    .hidden {
        opacity: 0;
    }
    span {
        display: inline-block;
        border-radius: 50%;
        background-color: #fff;
    }
    .on {
        background-color: var(--color-focus);
    }
</style>
