<script lang="ts">
    import { loadGSIScript } from "$lib/scripts/utils";
    import { onMount } from "svelte";
    import { getOauthToken } from "$lib/scripts/utils";
    import googleIcon from "$lib/assets/google.png";

    // console.log($isLoggedin);
    onMount(() => {
        try {
            loadGSIScript();
        } catch (error) {
            console.warn(error);
        }
    });
</script>

<button
    on:click={getOauthToken}
    class="login"
    title="Sign in with Google"
    aria-label="Sign in with Google"
    type="button"><img src={googleIcon} alt="google icon" /></button
>

<style>
    .login {
        block-size: 3.6rem;
        inline-size: 3.6rem;
        padding: 0.2rem;
        border-radius: 50%;
        border: 1px solid var(--color-outline);
        filter: none;
    }
    .login:hover {
        border: none;
        outline: 1px solid var(--color-focus);
    }
    .login:active {
        padding: 0.5rem;
    }
</style>
