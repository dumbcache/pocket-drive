<script lang="ts">
    export let bool = false;
</script>

<div class="toggle">
    <span class="off s-second" class:hidden={bool}></span>
    <span class="on s-second" class:hidden={!bool}></span>
</div>

<style>
    .toggle {
        width: fit-content;
        background-color: var(--bg-color-four);
        display: flex;
        padding: 0.1rem;
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
    }
    .on {
        background-color: #f00;
    }
    .off {
        background-color: #fff;
    }
    .off:hover {
        background-color: var(--color-focus);
    }
</style>
