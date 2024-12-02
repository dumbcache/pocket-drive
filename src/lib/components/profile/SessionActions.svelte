<script lang="ts">
    import { signUserOut } from "$lib/scripts/utils";
    import { requestToken } from "$lib/scripts/login";
    import { states } from "$lib/scripts/stores.svelte";

    async function tokenHandler() {
        requestToken();
        states.profile = false;
    }
</script>

<button class="token" title="new session" onclick={tokenHandler}>
    <span>New Session</span>
</button>
<button class="logout" title="logout" onclick={signUserOut}>
    <span>Logout</span>
</button>

<style>
    button {
        width: 100%;
        padding: 1rem;
        background-color: var(--color-bg-one);
        border-top: 1px solid var(--color-lite);
        border-left: 1px solid var(--color-lite);
    }
    button:hover {
        filter: invert(0.1);
    }
</style>
