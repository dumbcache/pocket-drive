<script lang="ts">
    import { requestToken } from "$lib/scripts/login";
    import googleIcon from "$lib/assets/google.png";
</script>

<button
    onclick={requestToken}
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
