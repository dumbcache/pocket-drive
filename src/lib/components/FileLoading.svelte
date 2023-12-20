<script lang="ts">
    import Spinner from "./Spinner.svelte";

    export let status: string;
    status = "loading";
    $: console.log(status);
</script>

{#if status === "loading"}
    <Spinner />
{:else if status === "completed"}
    <div class="end">END</div>
{/if}

<style>
    .end {
        user-select: none;
        position: relative;
        padding: 5rem;
        color: #555;
    }
    .end::after,
    .end::before {
        position: absolute;
        top: 50%;
        /* left: 0%; */
        content: " ";
        width: 10rem;
        padding: 0rem 1rem;
        border-bottom: 1px solid #555;
    }
    .end::after {
        right: -6rem;
    }
    .end::before {
        left: -6rem;
    }
</style>
