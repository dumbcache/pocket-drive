<script lang="ts">
    import { loadGSIScript, requestToken } from "$lib/scripts/login";
    import { onMount } from "svelte";
    import googleIcon from "$lib/assets/google.png";
    import { checkNetworkError } from "$lib/scripts/utils";

    onMount(async () => {
        try {
            loadGSIScript();
        } catch (error) {
            checkNetworkError(error);
        }
    });
</script>

<button
    on:click={requestToken}
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
        filter: none;
    }
    .login:hover {
        border: none;
        padding: 0rem;
    }

    .login:active {
        padding: 0.5rem;
    }
</style>
