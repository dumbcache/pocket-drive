<script lang="ts">
    import logoutIcon from "$lib/assets/logout.svg?raw";
    import { signUserOut } from "$lib/scripts/utils";
    import { goto } from "$app/navigation";
    import { isLoggedin } from "$lib/scripts/stores";

    async function signoutHandler() {
        isLoggedin.set(false);
        await signUserOut();
        goto("/");
    }
</script>

<button class="signout" title="logout" on:click={signoutHandler}>
    <span>Logout</span>
    <!-- <span class="btn s-second">
        {@html logoutIcon}
    </span> -->
</button>

<style>
    .signout {
        display: flex;
    }
    .signout:hover {
        color: var(--color-focus);
    }
</style>
