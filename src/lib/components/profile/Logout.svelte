<script lang="ts">
    import { signUserOut } from "$lib/scripts/utils";
    import { goto } from "$app/navigation";
    import { isLoggedin, profile } from "$lib/scripts/stores";
    import { googleClient } from "$lib/scripts/login";

    async function signoutHandler() {
        isLoggedin.set(false);
        profile.set(false);
        await signUserOut();
        goto("/");
    }

    async function tokenHandler() {
        googleClient?.requestToken();
        profile.set(false);
    }
</script>

<button class="token" title="new session" on:click={tokenHandler}>
    <span>New Session</span>
</button>
<button class="logout" title="logout" on:click={signoutHandler}>
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
