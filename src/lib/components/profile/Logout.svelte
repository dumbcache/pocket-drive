<script lang="ts">
    import { signUserOut } from "$lib/scripts/utils";
    import { profile } from "$lib/scripts/stores";
    import { requestToken } from "$lib/scripts/login";

    async function tokenHandler() {
        requestToken();
        profile.set(false);
    }
</script>

<button class="token" title="new session" on:click={tokenHandler}>
    <span>New Session</span>
</button>
<button class="logout" title="logout" on:click={signUserOut}>
    <span>Logout</span>
</button>

<style>
    button {
        width: 100%;
        padding: 1rem;
        background-color: var(--color-bg-two);
    }
    button:hover {
        background-color: var(--color-bg-three);
    }
    .token {
        border-right: 1px solid var(--color-border);
    }
</style>
